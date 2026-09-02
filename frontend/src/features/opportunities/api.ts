import 'server-only';
import { apiRead, apiReadResult } from '@/lib/api-client';
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

/**
 * Reference lists for dropdowns and label maps. This one used to throw, which
 * fails `next build` whenever the API is unreachable — including the first
 * deploy, before the API exists. Empty lists degrade to raw codes on screen,
 * which is survivable; a failed build is not.
 */
export async function getOpportunityReference(): Promise<OpportunityReference> {
  const empty: OpportunityReference = {
    sectors: [],
    projectTypes: [],
    structures: [],
    ownerCategories: [],
    riskLevels: [],
    permitStatuses: [],
    dataRoomReadiness: [],
    verificationTiers: [],
  };
  return apiRead<OpportunityReference>('/reference/opportunities', empty, {
    revalidate: 3600,
  });
}

const EMPTY_LIST: OpportunityListResult = {
  items: [],
  total: 0,
  page: 1,
  limit: 0,
  pages: 1,
};

export async function listOpportunities(
  searchParams: Record<string, string | undefined>,
): Promise<OpportunityListResult> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v) qs.set(k, v);
  }
  return apiRead<OpportunityListResult>(`/opportunities?${qs.toString()}`, EMPTY_LIST);
}

/**
 * As listOpportunities, but reports whether the read succeeded so the page can
 * distinguish an empty market from an unreachable API.
 */
export async function listOpportunitiesResult(
  searchParams: Record<string, string | undefined>,
) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v) qs.set(k, v);
  }
  return apiReadResult<OpportunityListResult>(
    `/opportunities?${qs.toString()}`,
    EMPTY_LIST,
  );
}

/**
 * Passes the viewer's token when present, so an owner or access-granted user
 * sees the confidential fields. null covers not-found, no-access and an
 * unreachable API alike — the page renders notFound() for all three.
 */
export async function getOpportunity(id: string): Promise<Opportunity | null> {
  const token = await getAccessToken();
  return apiRead<Opportunity | null>(`/opportunities/${id}`, null, { auth: !!token });
}

export async function listMyOpportunities(): Promise<Opportunity[]> {
  return apiRead<Opportunity[]>('/opportunities/mine', [], { auth: true });
}
