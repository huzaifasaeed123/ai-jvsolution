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
  maxAge: 60 * 60, // 1h (access token itself expires sooner; refresh renews)
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7d
};
