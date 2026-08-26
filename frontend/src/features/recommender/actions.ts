'use server';

import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { RecommendationResult, RecommenderInputs } from './types';

export async function recommendStructures(
  inputs: RecommenderInputs,
): Promise<RecommendationResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}/recommender/structures`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(inputs),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(message) ? message.join(', ') : (message ?? 'Request failed'));
  }
  return data as RecommendationResult;
}
