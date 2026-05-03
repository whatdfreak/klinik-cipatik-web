import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unrestricted access to the login page and login API
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    // If already authenticated and trying to visit login UI, redirect to admin dashboard
    if (sessionCookie && pathname === '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect /admin and /api/admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    if (!sessionCookie) {
      // If it's an API route, return 401 Unauthorized
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // If it's a UI route, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/api/admin/:path*'],
};
