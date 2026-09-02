import 'server-only';
import { apiRead } from '@/lib/api-client';
import type { Mandate, MatchResult } from './types';

export function listMyMandates(): Promise<Mandate[]> {
  return apiRead<Mandate[]>('/mandates/mine', [], { auth: true });
}

/** null when it does not exist, is not yours, or the API is unreachable. */
export function getMandate(id: string): Promise<Mandate | null> {
  return apiRead<Mandate | null>(`/mandates/${id}`, null, { auth: true });
}

export function getMandateMatches(id: string): Promise<MatchResult> {
  return apiRead<MatchResult>(
    `/mandates/${id}/matches`,
    { mandateId: id, count: 0, matches: [] },
    { auth: true },
  );
}
