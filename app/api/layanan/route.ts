import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Menarik data layanan dengan kekuatan Admin (Bypass RLS)
    const { data, error } = await supabaseAdmin.from('services').select('*');
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    // API Error Layanan
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}