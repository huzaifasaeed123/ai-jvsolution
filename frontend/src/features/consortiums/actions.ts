'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Consortium } from './types';

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

export async function createConsortium(input: { name: string; description?: string; opportunityId?: string }): Promise<Consortium> {
  const r = (await authed('/consortiums', { method: 'POST', body: JSON.stringify(input) })) as Consortium;
  revalidatePath('/dashboard/consortiums');
  return r;
}

export async function inviteMember(consortiumId: string, input: { email: string; role: string; equityPct?: number }) {
  await authed(`/consortiums/${consortiumId}/members`, { method: 'POST', body: JSON.stringify(input) });
  revalidatePath(`/dashboard/consortiums/${consortiumId}`);
}

export async function updateMember(consortiumId: string, memberId: string, input: { role?: string; equityPct?: number }) {
  await authed(`/consortiums/${consortiumId}/members/${memberId}`, { method: 'PATCH', body: JSON.stringify(input) });
  revalidatePath(`/dashboard/consortiums/${consortiumId}`);
}

export async function removeMember(consortiumId: string, memberId: string) {
  await authed(`/consortiums/${consortiumId}/members/${memberId}`, { method: 'DELETE' });
  revalidatePath(`/dashboard/consortiums/${consortiumId}`);
}

export async function respondInvite(consortiumId: string, memberId: string, accept: boolean) {
  await authed(`/consortium-members/${memberId}/${accept ? 'accept' : 'decline'}`, { method: 'POST' });
  revalidatePath(`/dashboard/consortiums/${consortiumId}`);
  revalidatePath('/dashboard/consortiums');
}

export async function disbandConsortium(consortiumId: string) {
  await authed(`/consortiums/${consortiumId}/disband`, { method: 'POST' });
  revalidatePath(`/dashboard/consortiums/${consortiumId}`);
}
