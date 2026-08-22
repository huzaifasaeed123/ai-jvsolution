import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { DataRoom } from './types';

/** Data room tree + accessible documents. Token (if present) reveals more. */
export async function getDataRoom(opportunityId: string): Promise<DataRoom | null> {
  const token = await getAccessToken();
  const res = await fetch(`${config.apiUrl}/opportunities/${opportunityId}/dataroom`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}
