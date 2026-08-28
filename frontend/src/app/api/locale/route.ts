import { NextResponse } from 'next/server';
import { LOCALE_COOKIE, isLocale } from '@/i18n/config';

/** Persists the chosen locale in a cookie; the server reads it on next render. */
export async function POST(req: Request) {
  const { locale } = (await req.json().catch(() => ({}))) as { locale?: string };
  if (!isLocale(locale)) {
    return NextResponse.json({ message: 'Unsupported locale' }, { status: 400 });
  }
  const res = NextResponse.json({ locale });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return res;
}
