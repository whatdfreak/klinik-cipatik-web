import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('appointments')
      .select('id, kode_booking, nama_pasien, no_hp, poli_tujuan, tanggal_kunjungan, status, created_at')
      .order('tanggal_kunjungan', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500);

    if (date) query = query.eq('tanggal_kunjungan', date);
    if (status && status !== 'Semua') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('[Admin API] Gagal mengambil data:', error.message);
    return NextResponse.json({ error: 'Gagal mengambil data antrean.' }, { status: 500 });
  }
}
