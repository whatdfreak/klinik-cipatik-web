import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type harus application/json.' },
        { status: 415 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        access_token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        },
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
