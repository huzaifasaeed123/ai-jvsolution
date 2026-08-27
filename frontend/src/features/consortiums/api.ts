import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Consortium, RefItem } from './types';

async function authedGet<T>(path: string, fallback: T): Promise<T> {
  const token = await getAccessToken();
  if (!token) return fallback;
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return fallback;
  return res.json();
}

export function listMyConsortiums(): Promise<Consortium[]> {
  return authedGet<Consortium[]>('/consortiums/mine', []);
}

export function getConsortium(id: string): Promise<Consortium | null> {
  return authedGet<Consortium | null>(`/consortiums/${id}`, null);
}

export async function getConsortiumRoles(): Promise<RefItem[]> {
  const res = await fetch(`${config.apiUrl}/reference/consortium`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return (await res.json()).roles;
}
