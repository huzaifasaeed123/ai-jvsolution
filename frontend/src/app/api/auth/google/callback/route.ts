import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config } from '@/lib/config';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_RETURN_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from '@/lib/auth-cookies';
import { safeReturnPath } from '@/lib/safe-redirect';
import type { AuthResult } from '@/features/auth/types';

/** Send the visitor back to /login with a code the page can explain. */
function fail(request: NextRequest, reason: string) {
  const url = new URL(`/login?error=${encodeURIComponent(reason)}`, request.url);
  const response = NextResponse.redirect(url);
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  response.cookies.delete(GOOGLE_RETURN_COOKIE);
  return response;
}

/**
 * Where Google sends the browser back.
 *
 * Two things make this safe. The `state` returned by Google must match the one
 * this browser was issued when the flow started — that is what stops an
 * attacker replaying their own authorization code into someone else's session.
 * And the tokens never appear in the URL: the backend hands back a single-use
 * handle, which is redeemed server to server here, so nothing sensitive lands
 * in browser history, server logs or a Referer header.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // The visitor pressed "Cancel" on the Google consent screen.
  if (params.get('error')) return fail(request, 'google_cancelled');

  const code = params.get('code');
  const state = params.get('state');
  const expectedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail(request, 'google_state');
  }

  // 1. Trade the code for a handle (the backend holds the client secret).
  const cbRes = await fetch(`${config.apiUrl}/auth/google/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    cache: 'no-store',
  });

  if (!cbRes.ok) {
    const body = (await cbRes.json().catch(() => ({}))) as { message?: string };
    // 403 is the unverified-email refusal and the suspended-account case; both
    // carry a message the person needs to read, so pass it through.
    if (cbRes.status === 403 && body.message) {
      const url = new URL(
        `/login?error=google_denied&message=${encodeURIComponent(body.message)}`,
        request.url,
      );
      return NextResponse.redirect(url);
    }
    return fail(request, 'google_failed');
  }

  const { handle } = (await cbRes.json()) as { handle: string; isNew: boolean };

  // 2. Redeem it for the tokens, server to server.
  const redeemRes = await fetch(`${config.apiUrl}/auth/google/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handle }),
    cache: 'no-store',
  });
  if (!redeemRes.ok) return fail(request, 'google_failed');

  const auth = (await redeemRes.json()) as AuthResult & { isNew: boolean };

  // A Google account that has not chosen its role goes to onboarding first;
  // everyone else resumes wherever they were headed.
  const stored = safeReturnPath(request.cookies.get(GOOGLE_RETURN_COOKIE)?.value);
  const destination = auth.user.roleConfirmed ? (stored ?? '/dashboard') : '/onboarding';

  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(ACCESS_COOKIE, auth.accessToken, accessCookieOptions);
  response.cookies.set(REFRESH_COOKIE, auth.refreshToken, refreshCookieOptions);
  response.cookies.delete(GOOGLE_STATE_COOKIE);
  response.cookies.delete(GOOGLE_RETURN_COOKIE);
  return response;
}
