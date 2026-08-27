import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Offer, ComparisonOutput } from './types';

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

/** Owner/admin: offers received on an opportunity. */
export function listOffersForOpportunity(opportunityId: string): Promise<Offer[]> {
  return authedGet<Offer[]>(`/opportunities/${opportunityId}/offers`, []);
}

/** Submitter: my offers across opportunities. */
export function listMyOffers(): Promise<Offer[]> {
  return authedGet<Offer[]>('/offers/mine', []);
}

/** Owner/admin: weighted comparison of received offers (default weights). */
export async function getOfferComparison(opportunityId: string): Promise<ComparisonOutput | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const res = await fetch(`${config.apiUrl}/opportunities/${opportunityId}/offers/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}
