import 'server-only';
import { apiRead } from '@/lib/api-client';
import { config } from '@/lib/config';
import type { EstimateReference } from './types';

export async function getEstimateReference(): Promise<EstimateReference> {
  return apiRead<EstimateReference>(
    '/reference/estimate',
    { specLevels: [], unitBases: [], costElements: [] },
    { revalidate: 3600 },
  );
}
