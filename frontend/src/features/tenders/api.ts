import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import { apiReadResult } from '@/lib/api-client';
import type {
  Tender,
  Addendum,
  Clarification,
  SwissChallenge,
  ProcurementReference,
} from './types';

/**
 * Public reads pass the token when present so the authority sees drafts.
 * An endpoint that legitimately returns null (e.g. a tender with no Swiss
 * Challenge) sends 200 with an EMPTY body, which res.json() would throw on —
 * so parse defensively and fall back.
 */
async function get<T>(path: string, fallback: T, cache: RequestCache = 'no-store'): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache,
  });
  if (!res.ok) return fallback;
  const text = await res.text();
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/** As listPublicTenders, but reports whether the read actually succeeded. */
export async function listPublicTendersResult(
  params: { countryCode?: string; stage?: string } = {},
) {
  const qs = new URLSearchParams();
  if (params.countryCode) qs.set('countryCode', params.countryCode);
  if (params.stage) qs.set('stage', params.stage);
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiReadResult<Tender[]>(`/tenders${suffix}`, []);
}

export function listPublicTenders(params: { countryCode?: string; stage?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.countryCode) qs.set('countryCode', params.countryCode);
  if (params.stage) qs.set('stage', params.stage);
  const suffix = qs.toString() ? `?${qs}` : '';
  return get<Tender[]>(`/tenders${suffix}`, []);
}

export async function getTender(id: string): Promise<Tender | null> {
  return get<Tender | null>(`/tenders/${id}`, null);
}

export function listMyTenders() {
  return get<Tender[]>('/tenders/mine', []);
}

export function listTendersForOpportunity(opportunityId: string) {
  return get<Tender[]>(`/opportunities/${opportunityId}/tenders`, []);
}

export function listAddenda(tenderId: string) {
  return get<Addendum[]>(`/tenders/${tenderId}/addenda`, []);
}

export function listClarifications(tenderId: string) {
  return get<Clarification[]>(`/tenders/${tenderId}/clarifications`, []);
}

export function getChallenge(tenderId: string) {
  return get<SwissChallenge | null>(`/tenders/${tenderId}/challenge`, null);
}

export function getProcurementReference() {
  return get<ProcurementReference>(
    '/reference/procurement',
    {
      procurementTypes: [],
      tenderStages: [],
      paymentMechanisms: [],
      riskCategories: [],
      riskBearers: [],
      defaultEvaluationCriteria: [],
    },
    'force-cache',
  );
}
