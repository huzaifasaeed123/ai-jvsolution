/**
 * Cookie names + options for the auth session. Tokens are stored httpOnly so
 * client JS can never read them (mitigates XSS token theft). Server components
 * and route handlers read them via next/headers.
 */
export const ACCESS_COOKIE = 'jv_access';
export const REFRESH_COOKIE = 'jv_refresh';

const isProd = process.env.NODE_ENV === 'production';

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  // Matched to the API's JWT_ACCESS_TTL so the cookie's presence tracks the
  // token's validity. Middleware renews it from the refresh cookie before it
  // lapses, so the session still lasts as long as the refresh token does.
  maxAge: 15 * 60,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7d
};

export const GOOGLE_STATE_COOKIE = 'jv_oauth_state';
export const GOOGLE_RETURN_COOKIE = 'jv_oauth_next';

/**
 * For values that only need to survive the redirect to Google and back.
 * sameSite must be 'lax' rather than 'strict': the callback arrives as a
 * top-level navigation from accounts.google.com, and a strict cookie would not
 * be sent on it, breaking the state check we are relying on.
 */
export const shortLivedCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 10 * 60,
};
