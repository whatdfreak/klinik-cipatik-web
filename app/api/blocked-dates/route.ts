import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET() {
  try {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const { data, error } = await supabaseAdmin
      .from('blocked_dates')
      .select('id, tanggal, keterangan')
      .gte('tanggal', todayStr)
      .order('tanggal', { ascending: true });
      
    if (error) {
      // Blocked dates table error
      return NextResponse.json({ data: [] });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    if (searchParams.get('action') === 'sync') {
      // Auto-Sync from National Holidays API (GitHub Raw)
      const res = await fetch(`https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/holidays.json`);
      if (!res.ok) throw new Error("Gagal mengambil data dari API pihak ketiga");
      
      const holidays = await res.json();
      const payload = Object.keys(holidays)
        .filter(key => key !== 'info')
        .map(date => ({
          tanggal: date,
          keterangan: holidays[date].summary || 'Libur Nasional'
        }));
      
      if (payload.length > 0) {
        const { error } = await supabaseAdmin
          .from('blocked_dates')
          .upsert(payload, { onConflict: 'tanggal', ignoreDuplicates: true });
          
        if (error) throw error;
      }
      return NextResponse.json({ success: true, synced: payload.length });
    }

    // Manual Insert (Bulk)
    const { dates, keterangan } = await req.json();
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'Tanggal wajib diisi' }, { status: 400 });
    }

    const payload = dates.map(d => ({ tanggal: d, keterangan: keterangan || 'Libur' }));
    
    const { error } = await supabaseAdmin
      .from('blocked_dates')
      .upsert(payload, { onConflict: 'tanggal', ignoreDuplicates: true });
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 });

    const { error } = await supabaseAdmin.from('blocked_dates').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
