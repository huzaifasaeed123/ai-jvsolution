'use server';

import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { EstimateResult } from './types';

async function post(path: string, body: unknown) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${config.apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string | string[] }).message;
    throw new Error(Array.isArray(message) ? message.join(', ') : (message ?? 'Request failed'));
  }
  return data;
}

export async function computeEstimate(inputs: Record<string, unknown>): Promise<EstimateResult> {
  return (await post('/estimate/compute', inputs)) as EstimateResult;
}

export async function saveEstimate(
  inputs: Record<string, unknown> & { opportunityId?: string; label?: string },
): Promise<{ id: string }> {
  return (await post('/estimate', inputs)) as { id: string };
}
