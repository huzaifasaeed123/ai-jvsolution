import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';

/**
 * Streams a document download through the BFF: reads the httpOnly session token,
 * calls the API with a Bearer header, and pipes the response back to the browser.
 * The API enforces the permission check + writes the audit entry.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;

  const upstream = await fetch(`${config.apiUrl}/documents/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Not available', { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': upstream.headers.get('content-disposition') ?? 'attachment',
    },
  });
}
