import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';

/**
 * Proxy for onboarding's role choice. Exists so the browser never handles the
 * bearer token — it lives in an httpOnly cookie that only the server can read.
 */
export async function PATCH(request: Request) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${config.apiUrl}/auth/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return NextResponse.json(data, { status: res.status });
}
