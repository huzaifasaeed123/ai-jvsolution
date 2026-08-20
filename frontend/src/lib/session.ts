import 'server-only';
import { cookies } from 'next/headers';
import { config } from './config';
import { ACCESS_COOKIE } from './auth-cookies';
import type { User } from '@/features/auth/types';

/**
 * Reads the session cookie and resolves the current user via the API.
 * Server-only. Returns null when unauthenticated. Used by protected layouts.
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${config.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
}

/** Default landing route per role after login. */
export function dashboardPathFor(_role: string): string {
  return '/dashboard';
}
