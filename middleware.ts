import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

// ── CSRF Protection Helper ─────────────────────────────────────────────────
// Validates that state-changing requests originate from our own domain.
// Uses Origin header (primary) with Referer header as fallback.
const STATE_CHANGING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

function isValidOrigin(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // Only enforce CSRF checks on state-changing methods
  if (!STATE_CHANGING_METHODS.has(method)) return true;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // Build the set of allowed origins
  const allowedOrigins = new Set<string>();

  // Always allow the host-derived origin
  if (host) {
    allowedOrigins.add(`https://${host}`);
    allowedOrigins.add(`http://${host}`);
  }

  // Allow the configured site URL (for production Vercel deployments)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    // Normalize: remove trailing slash
    allowedOrigins.add(siteUrl.replace(/\/+$/, ''));
  }

  // In development, also allow common localhost variants
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.add('http://localhost:3000');
    allowedOrigins.add('http://127.0.0.1:3000');
  }

  // Check Origin header first (most reliable, set by all modern browsers)
  if (origin) {
    return allowedOrigins.has(origin);
  }

  // Fallback: check Referer header
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return allowedOrigins.has(refererOrigin);
    } catch {
      return false;
    }
  }

  // No Origin AND no Referer: reject as suspicious
  // (All modern browsers send at least one for same-origin form/fetch requests)
  return false;
}

// ── Main Middleware ─────────────────────────────────────────────────────────
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

    // CSRF check on login POST — prevent cross-origin login attacks
    if (request.method === 'POST' && pathname === '/api/admin/login') {
      if (!isValidOrigin(request)) {
        return NextResponse.json(
          { error: 'Permintaan ditolak: origin tidak valid (CSRF).' },
          { status: 403 }
        );
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

    // ── TD-11: CSRF Protection for state-changing API requests ──────────
    if (pathname.startsWith('/api/') && !isValidOrigin(request)) {
      return NextResponse.json(
        { error: 'Permintaan ditolak: origin tidak valid (CSRF).' },
        { status: 403 }
      );
    }
  }

  // ── CSRF for non-admin state-changing API routes ──────────────────────
  // (e.g. /api/blocked-dates POST/DELETE, /api/reservasi POST)
  if (pathname.startsWith('/api/') && !isValidOrigin(request)) {
    return NextResponse.json(
      { error: 'Permintaan ditolak: origin tidak valid (CSRF).' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/api/:path*'],
};
