/**
 * lib/session.ts — Signed Session Token Utility
 *
 * Creates and verifies HMAC-SHA256 signed session tokens for admin authentication.
 * Compatible with both Edge Runtime (middleware) and Node.js Runtime (API routes)
 * via the Web Crypto API (crypto.subtle).
 *
 * Token format: `<base64url-payload>.<hex-signature>`
 * Payload: { sub: 'admin', iat: number, exp: number }
 */

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET or ADMIN_PASSWORD must be set.');
  return secret;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  return atob(padded);
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toHex(signature);
}

/**
 * Create a signed session token for admin authentication.
 * The token is self-contained (no server-side storage needed).
 */
export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: 'admin',
      iat: Date.now(),
      exp: Date.now() + SESSION_DURATION_MS,
    })
  );
  const signature = await hmacSign(payload, secret);
  return `${payload}.${signature}`;
}

/**
 * Verify a session token's signature and expiry.
 * Returns true only if HMAC signature is valid AND token has not expired.
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;

    const payload = token.substring(0, dotIndex);
    const signature = token.substring(dotIndex + 1);

    const secret = getSecret();
    const expectedSignature = await hmacSign(payload, secret);

    // Constant-time comparison (best effort in JS)
    if (signature.length !== expectedSignature.length) return false;
    let mismatch = 0;
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    if (mismatch !== 0) return false;

    // Verify expiry
    const data = JSON.parse(base64UrlDecode(payload));
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return false;
    if (data.sub !== 'admin') return false;

    return true;
  } catch {
    return false;
  }
}
