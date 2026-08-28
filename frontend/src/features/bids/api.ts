import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Bid, TenderBids } from './types';

async function get<T>(path: string, fallback: T): Promise<T> {
  const token = await getAccessToken();
  if (!token) return fallback;
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return fallback;
  const text = await res.text();
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function listMyBids() {
  return get<Bid[]>('/bids/mine', []);
}

export function getBid(id: string) {
  return get<Bid | null>(`/bids/${id}`, null);
}

/** Authority view — sealed until the tender's submission deadline passes. */
export function listBidsForTender(tenderId: string) {
  return get<TenderBids | null>(`/tenders/${tenderId}/bids`, null);
}
