import 'server-only';
import { apiRead } from '@/lib/api-client';
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
  // Reference lists only supply labels; empty means codes show raw, which is
  // far better than the passport panel taking the whole page down.
  return apiRead<VerificationReference>(
    '/reference/verification',
    { tiers: [], verifiableFields: [] },
    { revalidate: 3600 },
  );
}
