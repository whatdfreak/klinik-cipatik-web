import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    return NextResponse.json({ success: true, message: 'Logout berhasil.' });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan saat logout.' }, { status: 500 });
  }
}
