'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Offer, OfferInput, OfferStatus, ComparisonOutput } from './types';

async function authed(path: string, init: RequestInit) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const m = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(m) ? m.join(', ') : (m ?? 'Request failed'));
  }
  return data;
}

export async function submitOffer(opportunityId: string, input: OfferInput): Promise<Offer> {
  const r = (await authed(`/opportunities/${opportunityId}/offers`, { method: 'POST', body: JSON.stringify(input) })) as Offer;
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath('/dashboard/offers');
  return r;
}

export async function updateOffer(offerId: string, opportunityId: string, input: OfferInput): Promise<Offer> {
  const r = (await authed(`/offers/${offerId}`, { method: 'PATCH', body: JSON.stringify(input) })) as Offer;
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath('/dashboard/offers');
  return r;
}

export async function withdrawOffer(offerId: string, opportunityId: string): Promise<void> {
  await authed(`/offers/${offerId}/withdraw`, { method: 'POST' });
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath('/dashboard/offers');
}

export async function setOfferStatus(offerId: string, opportunityId: string, status: OfferStatus): Promise<void> {
  await authed(`/offers/${offerId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  revalidatePath(`/opportunities/${opportunityId}`);
}

export async function compareOffers(
  opportunityId: string,
  weights: Record<string, number>,
): Promise<ComparisonOutput> {
  return (await authed(`/opportunities/${opportunityId}/offers/compare`, {
    method: 'POST',
    body: JSON.stringify({ weights }),
  })) as ComparisonOutput;
}
