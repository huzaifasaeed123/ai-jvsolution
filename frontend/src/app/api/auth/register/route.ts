import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from '@/lib/auth-cookies';
import type { AuthResult } from '@/features/auth/types';

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${config.apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { message: data.message ?? 'Registration failed' },
      { status: res.status },
    );
  }

  const auth = data as AuthResult;
  const response = NextResponse.json({ user: auth.user });
  response.cookies.set(ACCESS_COOKIE, auth.accessToken, accessCookieOptions);
  response.cookies.set(REFRESH_COOKIE, auth.refreshToken, refreshCookieOptions);
  return response;
}
