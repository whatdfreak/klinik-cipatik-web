import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      // ADMIN_USERNAME or ADMIN_PASSWORD is not set
      return NextResponse.json({ error: 'Konfigurasi server tidak valid.' }, { status: 500 });
    }

    if (username === validUsername && password === validPassword) {
      // Create a signed session token (HMAC-SHA256)
      const sessionToken = await createSessionToken();
      
      const cookieStore = await cookies();
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true, message: 'Login berhasil.' });
    }

    return NextResponse.json({ error: 'Username atau Password salah.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
