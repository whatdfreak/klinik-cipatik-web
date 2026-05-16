import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unrestricted access to the login page and login API
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    // If already authenticated and trying to visit login UI, redirect to admin dashboard
    if (sessionCookie && pathname === '/admin/login') {
      const isValid = await verifySessionToken(sessionCookie);
      if (isValid) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // Protect admin UI/API and dashboard stats
  const isProtectedRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/dashboard');

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    if (!sessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // Verify the token signature and expiry
    const isValid = await verifySessionToken(sessionCookie);
    if (!isValid) {
      // Invalid or expired token — clear the cookie and reject
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Session expired or invalid.' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin/login', request.url));

      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/api/admin/:path*', '/api/dashboard/:path*'],
};
