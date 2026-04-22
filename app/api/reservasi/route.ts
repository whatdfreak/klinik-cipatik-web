import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// INI ADALAH KLIEN KHUSUS SERVER (Menggunakan Kunci Master untuk bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nik, name, date_of_birth, phone_number, service_id, complaint } = body;

    // 1. Simpan Data Pasien menggunakan Supabase Admin
    const { data: patientData, error: patientError } = await supabaseAdmin
      .from('patients')
      .upsert(
        { nik, name, date_of_birth, phone_number, is_bpjs: false },
        { onConflict: 'nik' }
      )
      .select()
      .single();

    if (patientError) throw new Error(`Gagal menyimpan data pasien: ${patientError.message}`);

    // 2. Buat Antrean Baru menggunakan Supabase Admin
    const { error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert([
        {
          patient_id: patientData.id,
          service_id: service_id,
          appointment_date: new Date().toISOString(),
          complaint: complaint,
          is_bpjs_visit: false,
          status: 'scheduled'
        }
      ]);

    if (appointmentError) throw new Error(`Gagal membuat antrean: ${appointmentError.message}`);

    return NextResponse.json({ message: 'Pendaftaran antrean berhasil disimpan!' }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}