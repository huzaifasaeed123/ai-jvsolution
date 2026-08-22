'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';

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

export async function initDataRoom(opportunityId: string) {
  const result = await authedFetch(`/opportunities/${opportunityId}/dataroom/init`, { method: 'POST' });
  revalidatePath(`/opportunities/${opportunityId}`);
  return result;
}

export async function deleteDocument(documentId: string, opportunityId: string) {
  await authedFetch(`/documents/${documentId}`, { method: 'DELETE' });
  revalidatePath(`/opportunities/${opportunityId}`);
}
