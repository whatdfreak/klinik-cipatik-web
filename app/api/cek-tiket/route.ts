import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET /api/cek-tiket?kodes=CPTK-AAAA,CPTK-BBBB
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kodeParam = searchParams.get('kodes') ?? '';
    const kodes = kodeParam.split(',').map(k => k.trim()).filter(Boolean).slice(0, 20);

    if (!kodes.length) return NextResponse.json({ data: [] });

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('kode_booking, status, poli_tujuan, tanggal_kunjungan')
      .in('kode_booking', kodes);

    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
