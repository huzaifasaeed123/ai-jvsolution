import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Passport, VerificationReference } from './types';

export async function getVerification(opportunityId: string): Promise<Passport | null> {
  const token = await getAccessToken();
  const res = await fetch(`${config.apiUrl}/opportunities/${opportunityId}/verification`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getVerificationReference(): Promise<VerificationReference> {
  const res = await fetch(`${config.apiUrl}/reference/verification`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to load verification reference');
  return res.json();
}
