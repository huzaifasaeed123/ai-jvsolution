import 'server-only';
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
  const res = await fetch(`${config.apiUrl}/reference/due-diligence`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to load due diligence reference');
  return res.json();
}
