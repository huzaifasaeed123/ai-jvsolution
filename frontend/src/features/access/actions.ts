'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { AccessRequest } from './types';

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

export async function requestAccess(opportunityId: string, message?: string): Promise<AccessRequest> {
  const result = (await authedFetch('/access-requests', {
    method: 'POST',
    body: JSON.stringify({ opportunityId, message }),
  })) as AccessRequest;
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath('/dashboard/requests');
  return result;
}

async function act(id: string, verb: string, opportunityId?: string): Promise<AccessRequest> {
  const result = (await authedFetch(`/access-requests/${id}/${verb}`, { method: 'POST' })) as AccessRequest;
  revalidatePath('/dashboard/requests');
  if (opportunityId) revalidatePath(`/opportunities/${opportunityId}`);
  return result;
}

export async function approveRequest(id: string): Promise<AccessRequest> {
  return act(id, 'approve');
}

export async function rejectRequest(id: string): Promise<AccessRequest> {
  return act(id, 'reject');
}

export async function revokeRequest(id: string): Promise<AccessRequest> {
  return act(id, 'revoke');
}

export async function signNda(id: string, opportunityId?: string): Promise<AccessRequest> {
  return act(id, 'nda', opportunityId);
}
