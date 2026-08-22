'use server';

import { revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Passport, VerificationTier } from './types';

export interface SetVerificationInput {
  tier: VerificationTier;
  verifiedFields?: string[];
  unresolvedItems?: string[];
  notes?: string;
}

export async function setVerification(
  opportunityId: string,
  input: SetVerificationInput,
): Promise<Passport> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}/opportunities/${opportunityId}/verification`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(message) ? message.join(', ') : (message ?? 'Request failed'));
  }
  revalidatePath(`/opportunities/${opportunityId}`);
  return data as Passport;
}
