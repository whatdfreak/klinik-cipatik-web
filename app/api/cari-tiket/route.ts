import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as z from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const jsonHeaders = { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' };

// Skema validasi ketat — hanya input yang valid yang diproses
const bodySchema = z.object({
  nik: z.string().length(16).regex(/^\d+$/),
  no_hp: z.string().regex(/^08[0-9]{7,11}$/),
});

// POST /api/cari-tiket
// Body: { nik: string, no_hp: string }
// Response: { data: BookingInfo[] }
export async function POST(request: Request) {
  try {
    // Content-Type guard
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type harus application/json.' }, { status: 415, headers: jsonHeaders });
    }

    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: 'Payload JSON tidak valid.' }, { status: 400, headers: jsonHeaders }); }

    const parse = bodySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'NIK atau Nomor HP tidak valid.' }, { status: 400, headers: jsonHeaders });
    }

    const { nik, no_hp } = parse.data;

    // Hanya cari tiket yang masih aktif (Menunggu / Hadir) dan tanggalnya tidak lewat
    const jakartaToday = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const todayStr = `${jakartaToday.getFullYear()}-${String(jakartaToday.getMonth() + 1).padStart(2, '0')}-${String(jakartaToday.getDate()).padStart(2, '0')}`;

      const { data, error } = await supabaseAdmin
        .from('appointments')
        .select('kode_booking, nama_pasien, poli_tujuan, tanggal_kunjungan, status')
        .eq('nik', nik)
        .eq('no_hp', no_hp)
        .order('tanggal_kunjungan', { ascending: false })
        .limit(20); // tampilkan histori 20 tiket terakhir

    if (error) throw error;

    // Transformasi ke format BookingInfo yang dipakai frontend
    const tickets = (data ?? []).map((row) => {
      const poliRaw: string = row.poli_tujuan ?? '';
      // Format: "Poli Umum - Pagi" atau "Poli Umum - Sore"
      const parts = poliRaw.split(' - ');
      const poli = parts[0]?.trim() ?? poliRaw;
      const sesiKey = parts[1]?.trim() ?? '';
      const sesi = sesiKey === 'Pagi' ? 'Pagi (08:00 - 12:00)' : sesiKey === 'Sore' ? 'Sore (14:00 - 18:00)' : sesiKey;

      return {
        kode: row.kode_booking,
        nama: row.nama_pasien,
        tanggal: row.tanggal_kunjungan,
        poli,
        sesi,
        status: row.status,
      };
    });

    return NextResponse.json({ data: tickets }, { headers: jsonHeaders });

  } catch (error: any) {
    // /api/cari-tiket error
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500, headers: jsonHeaders });
  }
}
