import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { AccessRequest } from './types';

async function authedGet<T>(path: string): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  // Endpoint may legitimately return an empty body (e.g. null request) → treat as null.
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

/** The current user's request for one opportunity (null if none / not logged in). */
export function getMyRequestFor(opportunityId: string): Promise<AccessRequest | null> {
  return authedGet<AccessRequest>(`/access-requests/for/${opportunityId}`);
}

export async function listIncoming(): Promise<AccessRequest[]> {
  return (await authedGet<AccessRequest[]>('/access-requests/incoming')) ?? [];
}

export async function listMine(): Promise<AccessRequest[]> {
  return (await authedGet<AccessRequest[]>('/access-requests/mine')) ?? [];
}
