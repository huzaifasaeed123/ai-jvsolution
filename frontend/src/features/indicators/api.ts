import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { InvestorDashboardData } from './types';

/** Returns null when the viewer is not permitted (403) or the opp is missing. */
export async function getInvestorDashboard(opportunityId: string): Promise<InvestorDashboardData | null> {
  const token = await getAccessToken();
  const res = await fetch(`${config.apiUrl}/opportunities/${opportunityId}/dashboard`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}
