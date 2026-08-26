'use server';

import { config } from '@/lib/config';
import { getAccessToken } from '@/lib/session';
import type { ValuationMethod, ValuationResult } from './types';

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

export async function computeValuation(
  method: ValuationMethod,
  inputs: Record<string, unknown>,
): Promise<ValuationResult> {
  return (await post('/valuation/compute', { method, inputs })) as ValuationResult;
}

export async function saveValuation(
  method: ValuationMethod,
  inputs: Record<string, unknown>,
  opts: { opportunityId?: string; label?: string } = {},
): Promise<{ id: string }> {
  return (await post('/valuation', { method, inputs, ...opts })) as { id: string };
}
