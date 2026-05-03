import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const VALID_STATUSES = ['Menunggu', 'Hadir', 'Selesai', 'Batal'] as const;

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select('id, kode_booking, status')
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    // [Admin API] Gagal update status
    return NextResponse.json({ error: 'Gagal mengubah status.' }, { status: 500 });
  }
}
