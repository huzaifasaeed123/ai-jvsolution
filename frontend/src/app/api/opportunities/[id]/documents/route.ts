import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';

/**
 * Proxies a multipart document upload to the API with the Bearer token attached.
 * Keeps the httpOnly session server-side; the browser never sees the token.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const form = await req.formData();
  const upstream = await fetch(`${config.apiUrl}/opportunities/${id}/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
