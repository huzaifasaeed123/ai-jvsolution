'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Opportunity } from './types';

/**
 * Server actions for owner mutations. They read the httpOnly session token on
 * the server and call the API — the token never reaches the browser. Client
 * forms invoke these directly.
 */

export interface CreateOpportunityInput {
  title: string;
  summary?: string;
  sector: string;
  projectType?: string;
  ownerCategory: 'PRIVATE' | 'SEMI_GOVERNMENT' | 'GOVERNMENT';
  countryCode: string;
  region?: string;
  city?: string;
  addressLine?: string;
  landAreaSqm?: number;
  gfaSqm?: number;
  currency?: string;
  projectValue?: number;
  investmentRequired?: number;
  targetIrr?: number;
  developmentPeriodMonths?: number;
  concessionPeriodYears?: number;
  structures?: string[];
  riskLevel?: 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH';
  requiredDeveloperExperience?: string;
  financingRequired?: boolean;
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

export async function createOpportunity(input: CreateOpportunityInput): Promise<Opportunity> {
  const result = (await authedFetch('/opportunities', {
    method: 'POST',
    body: JSON.stringify(input),
  })) as Opportunity;
  revalidatePath('/dashboard/opportunities');
  return result;
}

export async function publishOpportunity(id: string): Promise<Opportunity> {
  const result = (await authedFetch(`/opportunities/${id}/publish`, { method: 'POST' })) as Opportunity;
  revalidatePath('/dashboard/opportunities');
  revalidatePath(`/opportunities/${id}`);
  return result;
}

export async function deleteOpportunity(id: string): Promise<void> {
  await authedFetch(`/opportunities/${id}`, { method: 'DELETE' });
  revalidatePath('/dashboard/opportunities');
}
