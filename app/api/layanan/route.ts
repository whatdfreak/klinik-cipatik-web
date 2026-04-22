import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Menggunakan Kunci Master secara aman di sisi Server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function GET() {
  try {
    // Menarik data layanan dengan kekuatan Admin (Bypass RLS)
    const { data, error } = await supabaseAdmin.from('services').select('*');
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API Error Layanan:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}