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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('appointments')
      .select('id, kode_booking, nama_pasien, no_hp, poli_tujuan, tanggal_kunjungan, status, created_at')
      .order('tanggal_kunjungan', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1000);

    if (startDate) query = query.gte('tanggal_kunjungan', startDate);
    if (endDate) query = query.lte('tanggal_kunjungan', endDate);
    if (status && status !== 'Semua') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    // [Admin API] Gagal mengambil data
    return NextResponse.json({ error: 'Gagal mengambil data antrean.' }, { status: 500 });
  }
}
