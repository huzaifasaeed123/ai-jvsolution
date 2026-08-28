'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Bid, BidInput } from './types';

async function authed(path: string, init: RequestInit) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const m = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(m) ? m.join(', ') : (m ?? 'Request failed'));
  }
  return data;
}

export async function startBid(tenderId: string, input: BidInput): Promise<Bid> {
  const bid = (await authed(`/tenders/${tenderId}/bids`, {
    method: 'POST',
    body: JSON.stringify(input),
  })) as Bid;
  revalidatePath('/dashboard/bids');
  return bid;
}

export async function updateBid(bidId: string, input: BidInput): Promise<Bid> {
  const bid = (await authed(`/bids/${bidId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })) as Bid;
  revalidatePath('/dashboard/bids');
  revalidatePath(`/dashboard/bids/${bidId}`);
  return bid;
}

export async function submitBid(bidId: string): Promise<Bid> {
  const bid = (await authed(`/bids/${bidId}/submit`, { method: 'POST' })) as Bid;
  revalidatePath('/dashboard/bids');
  revalidatePath(`/dashboard/bids/${bidId}`);
  return bid;
}

export async function withdrawBid(bidId: string): Promise<Bid> {
  const bid = (await authed(`/bids/${bidId}/withdraw`, { method: 'POST' })) as Bid;
  revalidatePath('/dashboard/bids');
  revalidatePath(`/dashboard/bids/${bidId}`);
  return bid;
}

export async function askClarification(tenderId: string, question: string) {
  const r = await authed(`/tenders/${tenderId}/clarifications`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
  revalidatePath(`/tenders/${tenderId}`);
  return r;
}
