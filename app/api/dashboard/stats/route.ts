import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const jsonHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
};

/**
 * GET /api/dashboard/stats
 * Mengembalikan statistik ringkasan dashboard dari data reservasi hari ini.
 * TODO: Tambahkan auth guard (JWT / session check) sebelum production penuh.
 */
export async function GET() {
  try {
    // Hitung tanggal hari ini dalam zona WIB
    const now = new Date();
    const jakartaNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const todayStr = `${jakartaNow.getFullYear()}-${String(jakartaNow.getMonth() + 1).padStart(2, '0')}-${String(jakartaNow.getDate()).padStart(2, '0')}`;

    // Parallel queries untuk performa
    const [totalToday, menunggu, hadir, selesai, batal] = await Promise.all([
      supabaseAdmin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tanggal_kunjungan', todayStr),
      supabaseAdmin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tanggal_kunjungan', todayStr)
        .eq('status', 'Menunggu'),
      supabaseAdmin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tanggal_kunjungan', todayStr)
        .eq('status', 'Hadir'),
      supabaseAdmin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tanggal_kunjungan', todayStr)
        .eq('status', 'Selesai'),
      supabaseAdmin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tanggal_kunjungan', todayStr)
        .eq('status', 'Batal'),
    ]);

    // Cek error di salah satu query
    const errors = [totalToday, menunggu, hadir, selesai, batal].filter(q => q.error);
    if (errors.length > 0) {
      throw errors[0].error;
    }

    return NextResponse.json({
      success: true,
      message: 'Data statistik berhasil diambil',
      data: {
        tanggal: todayStr,
        total_pasien_hari_ini: totalToday.count ?? 0,
        total_pasien_menunggu: menunggu.count ?? 0,
        total_pasien_hadir: hadir.count ?? 0,
        total_pasien_selesai: selesai.count ?? 0,
        total_pasien_batal: batal.count ?? 0,
      },
    }, { status: 200, headers: jsonHeaders });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Terjadi kesalahan saat mengambil data statistik.',
    }, { status: 500, headers: jsonHeaders });
  }
}
