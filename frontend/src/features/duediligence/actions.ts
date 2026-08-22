'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { DdItem } from './types';

async function authedFetch(path: string, init: RequestInit) {
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(message) ? message.join(', ') : (message ?? 'Request failed'));
  }
  return data;
}

export async function seedDueDiligence(opportunityId: string) {
  const r = await authedFetch(`/opportunities/${opportunityId}/due-diligence/seed`, { method: 'POST' });
  revalidatePath(`/opportunities/${opportunityId}`);
  return r;
}

export async function createDdItem(
  opportunityId: string,
  input: { category: string; title: string },
): Promise<DdItem> {
  const r = (await authedFetch(`/opportunities/${opportunityId}/due-diligence`, {
    method: 'POST',
    body: JSON.stringify(input),
  })) as DdItem;
  revalidatePath(`/opportunities/${opportunityId}`);
  return r;
}

export async function updateDdItem(
  itemId: string,
  opportunityId: string,
  patch: Partial<Pick<DdItem, 'receipt' | 'reviewStatus' | 'riskRating' | 'closure' | 'finding'>>,
): Promise<DdItem> {
  const r = (await authedFetch(`/due-diligence/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })) as DdItem;
  revalidatePath(`/opportunities/${opportunityId}`);
  return r;
}

export async function deleteDdItem(itemId: string, opportunityId: string) {
  await authedFetch(`/due-diligence/${itemId}`, { method: 'DELETE' });
  revalidatePath(`/opportunities/${opportunityId}`);
}
