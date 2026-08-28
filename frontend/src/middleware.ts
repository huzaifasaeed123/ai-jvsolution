import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Aliased: Next reserves the name `config` for this file's matcher export.
import { config as appConfig } from '@/lib/config';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from '@/lib/auth-cookies';

/**
 * Silent session renewal.
 *
 * The access token is short-lived (15 minutes) and the refresh token lasts a
 * week, but nothing was ever spending the refresh token — so a signed-in user
 * simply appeared logged out a quarter of an hour in: the header fell back to
 * "Sign in", and the dashboard bounced them to /login mid-session.
 *
 * This renews the pair before the access token lapses. It runs on navigations
 * only (see the matcher below), never on static assets, and it fails open: if
 * the API cannot be reached the request continues rather than erroring.
 */

/** Seconds of remaining life below which we renew rather than risk a 401. */
const RENEW_WINDOW = 60;

/**
 * Read `exp` out of a JWT without verifying it.
 *
 * Safe here because the value only decides *whether to attempt* a renewal —
 * never to authorise anything. The API verifies every token it is handed, so a
 * forged `exp` buys an attacker nothing but a wasted refresh call.
 */
function secondsUntilExpiry(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(json) as { exp?: number };
    if (typeof exp !== 'number') return null;
    return exp - Math.floor(Date.now() / 1000);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  // Nothing to renew from, or the current token still has life in it.
  if (!refresh) return NextResponse.next();
  if (access) {
    const left = secondsUntilExpiry(access);
    if (left === null || left > RENEW_WINDOW) return NextResponse.next();
  }

  try {
    const res = await fetch(`${appConfig.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: 'no-store',
    });

    if (!res.ok) {
      // The refresh token is spent or revoked — clear both, so the user gets a
      // clean signed-out state instead of a session that half works.
      const cleared = NextResponse.next();
      cleared.cookies.delete(ACCESS_COOKIE);
      cleared.cookies.delete(REFRESH_COOKIE);
      return cleared;
    }

    const data = (await res.json()) as { accessToken: string; refreshToken: string };

    // Hand the fresh token to this same request, so the page rendering right
    // now sees a signed-in user instead of waiting for the next navigation.
    const headers = new Headers(request.headers);
    const existing = (headers.get('cookie') ?? '')
      .split('; ')
      .filter((c) => c && !c.startsWith(`${ACCESS_COOKIE}=`));
    headers.set('cookie', [...existing, `${ACCESS_COOKIE}=${data.accessToken}`].join('; '));

    const response = NextResponse.next({ request: { headers } });
    response.cookies.set(ACCESS_COOKIE, data.accessToken, accessCookieOptions);
    response.cookies.set(REFRESH_COOKIE, data.refreshToken, refreshCookieOptions);
    return response;
  } catch {
    // API unreachable — carry on rather than breaking the page.
    return NextResponse.next();
  }
}

/**
 * Skip Next internals, the image optimizer and static files. The auth route
 * handlers are skipped too, since they set these cookies themselves.
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/auth|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
