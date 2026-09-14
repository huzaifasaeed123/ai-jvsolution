import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config } from '@/lib/config';
import { GOOGLE_STATE_COOKIE, GOOGLE_RETURN_COOKIE, shortLivedCookie } from '@/lib/auth-cookies';
import { safeReturnPath } from '@/lib/safe-redirect';

/**
 * Starts the Google round trip.
 *
 * The consent URL and its `state` come from the backend, which owns the client
 * credentials. `state` is parked in a short-lived httpOnly cookie so the
 * callback can prove the response belongs to a flow this browser started —
 * without it, an attacker can hand a victim their own authorization code and
 * silently sign the victim into the attacker's account.
 */
export async function GET(request: NextRequest) {
  const res = await fetch(`${config.apiUrl}/auth/google/url`, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.redirect(new URL('/login?error=google_unavailable', request.url));
  }

  const { url, state } = (await res.json()) as { url: string; state: string };

  const response = NextResponse.redirect(url);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, shortLivedCookie);

  // Where to land afterwards. Validated to a path on this site before it is
  // stored, so a crafted link cannot bounce a freshly signed-in user to
  // another origin carrying their session with them.
  const next = safeReturnPath(request.nextUrl.searchParams.get('next'));
  if (next) response.cookies.set(GOOGLE_RETURN_COOKIE, next, shortLivedCookie);

  return response;
}
