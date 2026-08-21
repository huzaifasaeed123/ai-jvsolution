import 'server-only';
import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { Mandate, MatchResult } from './types';

async function authedGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export function listMyMandates(): Promise<Mandate[]> {
  return authedGet<Mandate[]>('/mandates/mine');
}

export function getMandate(id: string): Promise<Mandate> {
  return authedGet<Mandate>(`/mandates/${id}`);
}

export function getMandateMatches(id: string): Promise<MatchResult> {
  return authedGet<MatchResult>(`/mandates/${id}/matches`);
}
