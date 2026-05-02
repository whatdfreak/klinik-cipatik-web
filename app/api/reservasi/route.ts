import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as z from 'zod';
import { createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

type RateLimitEntry = { count: number; resetAt: number };
type IdempotencyEntry = { payloadHash: string; response: unknown; status: number; expiresAt: number };

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUEST = 10;
const MAX_BOOKING_PER_PHONE_PER_DAY = 3;
const MAX_BOOKING_WINDOW_DAYS = 30;
const MAX_BOOKING_PER_SESSION = 120;
const IDEMPOTENCY_TTL_MS = 2 * 60 * 1000;
// Sesuaikan dengan SOP klinik:
// - true: NIK boleh daftar >1x per hari jika beda sesi
// - false: NIK hanya boleh 1x per hari
const ALLOW_MULTI_BOOKING_SAME_NIK_PER_DAY = true;

const getRateLimitStore = (): Map<string, RateLimitEntry> => {
  const g = globalThis as typeof globalThis & {
    __cipatikReservasiRateLimit?: Map<string, RateLimitEntry>;
  };
  if (!g.__cipatikReservasiRateLimit) {
    g.__cipatikReservasiRateLimit = new Map<string, RateLimitEntry>();
  }
  return g.__cipatikReservasiRateLimit;
};

const getIdempotencyStore = (): Map<string, IdempotencyEntry> => {
  const g = globalThis as typeof globalThis & {
    __cipatikReservasiIdempotency?: Map<string, IdempotencyEntry>;
  };
  if (!g.__cipatikReservasiIdempotency) {
    g.__cipatikReservasiIdempotency = new Map<string, IdempotencyEntry>();
  }
  return g.__cipatikReservasiIdempotency;
};

const jakartaTodayDateOnly = () => {
  const now = new Date();
  const localJakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  localJakarta.setHours(0, 0, 0, 0);
  return localJakarta;
};

const normalizeName = (name: string) => name.replace(/\s+/g, ' ').trim();
const jsonHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
};

const serverSchema = z.object({
  nik: z.string().length(16).regex(/^\d+$/),

  nama_pasien: z
    .string()
    .min(3)
    .max(120)
    .regex(
      /^[a-zA-Z\s.,'-]+$/,
      'Nama hanya boleh berisi huruf, spasi, dan tanda baca dasar.'
    )
    .transform(normalizeName),

  no_hp: z
    .string()
    .regex(
      /^08[0-9]{7,11}$/,
      "Nomor HP harus diawali '08' dan terdiri dari 9-13 angka."
    ),

  poli_tujuan: z.enum(['Poli Umum', 'Poli Gigi', 'Poli KIA']),
  sesi_kunjungan: z.enum(['Pagi', 'Sore']),

  tanggal_kunjungan: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid.')
    .refine((val) => {
      const selected = new Date(val + 'T00:00:00+07:00');
      const today = jakartaTodayDateOnly();
      return selected >= today;
    }, { message: 'Tanggal kunjungan tidak boleh di masa lalu.' })
    .refine((val) => {
      const selected = new Date(val + 'T00:00:00+07:00');
      const today = jakartaTodayDateOnly();
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + MAX_BOOKING_WINDOW_DAYS);
      return selected <= maxDate;
    }, { message: `Reservasi maksimal hanya untuk ${MAX_BOOKING_WINDOW_DAYS} hari ke depan.` })
    .refine((val) => {
      const selected = new Date(val + 'T00:00:00+07:00');
      return selected.getDay() !== 0;
    }, { message: 'Klinik tutup di hari Minggu. Silakan pilih hari lain.' }),
});

const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CPTK-';
  for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const generateUniqueBookingCode = async (): Promise<string> => {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateBookingCode();
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('kode_booking', candidate)
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) return candidate;
  }
  throw new Error('Gagal menghasilkan kode booking unik.');
};

const sendWhatsAppNotification = async (no_hp: string, nama: string, kode: string, tanggal: string, poli: string, sesi: string) => {
  try {
    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      console.warn("FONNTE_TOKEN is missing. WhatsApp notification skipped.");
      return;
    }

    const tglFormatted = new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const sesiFormatted = sesi.includes('Pagi') ? 'Pagi (08:00 - 12:00)' : 'Sore (14:00 - 18:00)';

    const message = `*PENDAFTARAN BERHASIL* 🏥\nHalo *${nama}*,\n\nBerikut adalah detail reservasi Anda di Klinik Pratama Cipatik:\n\n🎫 Kode Booking: *${kode}*\n📅 Tanggal: *${tglFormatted}*\n🩺 Poli: *${poli}*\n⏰ Sesi: *${sesiFormatted}*\n\nHarap tangkap layar (screenshot) pesan ini atau tunjukkan kepada resepsionis saat kedatangan. Datanglah 15 menit lebih awal dari sesi Anda.\n\nTerima kasih,\n*Klinik Pratama Cipatik*`;

    const formData = new FormData();
    formData.append('target', no_hp);
    formData.append('message', message);
    formData.append('countryCode', '62'); // Fonnte will auto-format 08 -> 628

    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    const result = await res.json();
    if (!result.status) {
      console.error("❌ Fonnte API Error:", result.reason);
    } else {
    }
  } catch (error) {
    console.error("❌ Failed to send WhatsApp notification:", error);
  }
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type harus application/json.' }, { status: 415, headers: jsonHeaders });
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const rateLimitStore = getRateLimitStore();
    const nowMs = Date.now();
    const currentRate = rateLimitStore.get(ip);

    if (!currentRate || nowMs > currentRate.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: nowMs + RATE_LIMIT_WINDOW_MS });
    } else if (currentRate.count >= RATE_LIMIT_MAX_REQUEST) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Silakan tunggu beberapa menit lalu coba kembali.' },
        { status: 429, headers: jsonHeaders }
      );
    } else {
      currentRate.count += 1;
      rateLimitStore.set(ip, currentRate);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Payload JSON tidak valid.' }, { status: 400, headers: jsonHeaders });
    }

    // Honeypot anti-bot sederhana: field ini tidak pernah ada di UI normal
    if (typeof body === 'object' && body !== null && 'website' in body && (body as Record<string, unknown>).website) {
      return NextResponse.json({ error: 'Permintaan ditolak oleh sistem keamanan.' }, { status: 400, headers: jsonHeaders });
    }

    const parseResult = serverSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Data tidak valid atau format salah. Ditolak oleh server.' }, { status: 400, headers: jsonHeaders });
    }

    const { nik, nama_pasien, no_hp, poli_tujuan, sesi_kunjungan, tanggal_kunjungan } = parseResult.data;
    const payloadHash = createHash('sha256').update(JSON.stringify(parseResult.data)).digest('hex');

    const idempotencyKeyRaw = request.headers.get('x-idempotency-key');
    const idempotencyKey = idempotencyKeyRaw?.trim();
    if (idempotencyKey) {
      const idempotencyStore = getIdempotencyStore();
      const currentTime = Date.now();
      const existing = idempotencyStore.get(idempotencyKey);
      if (existing && existing.expiresAt > currentTime && existing.payloadHash === payloadHash) {
        return NextResponse.json(existing.response, { status: existing.status, headers: jsonHeaders });
      }
      if (existing && existing.expiresAt > currentTime && existing.payloadHash !== payloadHash) {
        return NextResponse.json(
          { error: 'Idempotency key sudah digunakan untuk payload berbeda.' },
          { status: 409, headers: jsonHeaders }
        );
      }
    }

    const targetDate = new Date(tanggal_kunjungan + 'T00:00:00+07:00');
    const today = jakartaTodayDateOnly();
    targetDate.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + MAX_BOOKING_WINDOW_DAYS);

    if (targetDate < today) {
      return NextResponse.json({ error: 'Tanggal kunjungan tidak boleh di masa lalu.' }, { status: 400, headers: jsonHeaders });
    }
    if (targetDate > maxDate) {
      return NextResponse.json({ error: `Reservasi maksimal hanya untuk ${MAX_BOOKING_WINDOW_DAYS} hari ke depan.` }, { status: 400, headers: jsonHeaders });
    }
    if (targetDate.getDay() === 0) {
      return NextResponse.json({ error: 'Klinik tutup di hari Minggu. Silakan pilih hari lain.' }, { status: 400, headers: jsonHeaders });
    }

    const poliGabungan = `${poli_tujuan} - ${sesi_kunjungan}`;

    const { data: existingRecords, error: checkError } = await supabaseAdmin
      .from('appointments')
      .select('id, nik, no_hp, poli_tujuan')
      .eq('tanggal_kunjungan', tanggal_kunjungan)
      .or(`nik.eq.${nik},no_hp.eq.${no_hp}`)
      .neq('status', 'Batal'); // Tiket yang dibatalkan tidak dihitung

    if (checkError) throw checkError;

    if (existingRecords) {
      const sameNik = existingRecords.filter(r => r.nik === nik);
      if (!ALLOW_MULTI_BOOKING_SAME_NIK_PER_DAY && sameNik.length > 0) {
        return NextResponse.json({ error: 'NIK ini sudah terdaftar untuk tanggal tersebut.' }, { status: 409, headers: jsonHeaders });
      }
      if (ALLOW_MULTI_BOOKING_SAME_NIK_PER_DAY) {
        // Tetap cegah duplikat sesi/poli yang sama
        const sameNikSameSession = sameNik.some((r) => r.poli_tujuan === poliGabungan);
        if (sameNikSameSession) {
          return NextResponse.json(
            { error: 'NIK ini sudah memiliki pendaftaran di sesi yang sama pada tanggal tersebut.' },
            { status: 409, headers: jsonHeaders }
          );
        }
      }
      
      const samePhone = existingRecords.filter(r => r.no_hp === no_hp);
      if (samePhone.length >= MAX_BOOKING_PER_PHONE_PER_DAY) {
        return NextResponse.json({ error: 'Nomor HP ini telah mencapai batas maksimal 3 pendaftaran per hari.' }, { status: 429, headers: jsonHeaders });
      }

      const samePhoneSameSession = samePhone.some((r) => r.poli_tujuan === poliGabungan);
      if (samePhoneSameSession) {
        return NextResponse.json({ error: 'Sesi untuk nomor HP ini sudah terdaftar di tanggal yang sama.' }, { status: 409, headers: jsonHeaders });
      }
    }

    const { count: sessionCount, error: sessionCountError } = await supabaseAdmin
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tanggal_kunjungan', tanggal_kunjungan)
      .eq('poli_tujuan', poliGabungan)
      .neq('status', 'Batal'); // Tiket batal tidak makan kuota

    if (sessionCountError) throw sessionCountError;
    if ((sessionCount ?? 0) >= MAX_BOOKING_PER_SESSION) {
      return NextResponse.json(
        { error: 'Kuota sesi untuk poli ini sudah penuh. Silakan pilih sesi atau tanggal lain.' },
        { status: 409, headers: jsonHeaders }
      );
    }

    const kode_booking = await generateUniqueBookingCode();
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert([{
        kode_booking,
        nik,
        nama_pasien,
        no_hp,
        poli_tujuan: poliGabungan,
        tanggal_kunjungan,
        status: 'Menunggu'
      }])
      .select(); 

    if (error) {
      console.error("❌ DB Insert Error [INTERNAL]:", error);
      return NextResponse.json({ error: 'Gagal menyimpan data ke sistem antrean klinik.' }, { status: 500, headers: jsonHeaders });
    }

    sendWhatsAppNotification(no_hp, nama_pasien, kode_booking, tanggal_kunjungan, poli_tujuan, sesi_kunjungan).catch(err => {
      console.error("Unhandled error in WhatsApp notification background task:", err);
    });

    const successPayload = { success: true, kode_booking, data: data[0] };
    if (idempotencyKey) {
      const idempotencyStore = getIdempotencyStore();
      idempotencyStore.set(idempotencyKey, {
        payloadHash,
        response: successPayload,
        status: 201,
        expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
      });
    }
    return NextResponse.json(successPayload, { status: 201, headers: jsonHeaders });

  } catch (error: any) {
    console.error("❌ Catch API Error [INTERNAL]:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server saat memproses reservasi.' }, { status: 500, headers: jsonHeaders });
  }
}