'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Mandate, OwnerCategory, RiskLevel } from './types';

export interface CreateMandateInput {
  title: string;
  sectors?: string[];
  countryCodes?: string[];
  projectTypes?: string[];
  structures?: string[];
  ownerCategories?: OwnerCategory[];
  currency?: string;
  minInvestment?: number;
  maxInvestment?: number;
  targetIrr?: number;
  riskAppetite?: RiskLevel;
  active?: boolean;
}

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

export async function createMandate(input: CreateMandateInput): Promise<Mandate> {
  const result = (await authedFetch('/mandates', {
    method: 'POST',
    body: JSON.stringify(input),
  })) as Mandate;
  revalidatePath('/dashboard/mandates');
  return result;
}

export async function deleteMandate(id: string): Promise<void> {
  await authedFetch(`/mandates/${id}`, { method: 'DELETE' });
  revalidatePath('/dashboard/mandates');
}
