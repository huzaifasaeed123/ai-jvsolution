import 'server-only';
import { apiRead } from '@/lib/api-client';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { DueDiligence, DdReference } from './types';

/** Returns null when the viewer is not permitted (403) or the opp is missing. */
export async function getDueDiligence(opportunityId: string): Promise<DueDiligence | null> {
  const token = await getAccessToken();
  const res = await fetch(`${config.apiUrl}/opportunities/${opportunityId}/due-diligence`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getDueDiligenceReference(): Promise<DdReference> {
  // Labels only. Empty degrades to raw codes rather than failing the page.
  return apiRead<DdReference>(
    '/reference/due-diligence',
    { categories: [], riskRatings: [], receiptStatuses: [], reviewStatuses: [], closureStatuses: [] },
    { revalidate: 3600 },
  );
}
