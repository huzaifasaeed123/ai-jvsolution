import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type {
  Opportunity,
  OpportunityListResult,
  OpportunityReference,
} from './types';

/**
 * Server-side read helpers for opportunities. Public reads work without a token;
 * detail passes the owner's token so confidential fields are revealed to them.
 */

export async function getOpportunityReference(): Promise<OpportunityReference> {
  const res = await fetch(`${config.apiUrl}/reference/opportunities`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to load reference data');
  return res.json();
}

export async function listOpportunities(
  searchParams: Record<string, string | undefined>,
): Promise<OpportunityListResult> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v) qs.set(k, v);
  }
  const res = await fetch(`${config.apiUrl}/opportunities?${qs.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load opportunities');
  return res.json();
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  const token = await getAccessToken();
  const res = await fetch(`${config.apiUrl}/opportunities/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load opportunity');
  return res.json();
}

export async function listMyOpportunities(): Promise<Opportunity[]> {
  const token = await getAccessToken();
  if (!token) return [];
  const res = await fetch(`${config.apiUrl}/opportunities/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load your opportunities');
  return res.json();
}
