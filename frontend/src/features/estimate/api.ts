import 'server-only';
import { config } from '@/lib/config';
import type { EstimateReference } from './types';

export async function getEstimateReference(): Promise<EstimateReference> {
  const res = await fetch(`${config.apiUrl}/reference/estimate`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to load estimate reference');
  return res.json();
}
