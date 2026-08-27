import { config } from '@/lib/config';

export interface PublicStats {
  publishedOpportunities: number;
  activeMandates: number;
  countriesWithOpportunities: number;
  totalProjectValue: number;
  verifiedOpportunities: number;
  partners: number;
  documentsSecured: number;
  marketsCovered: number;
  structuresSupported: number;
  generatedAt: string;
}

/**
 * Live platform statistics. Revalidated every 5 minutes — fresh enough for a
 * landing page without hitting the DB on every request.
 */
export async function getPublicStats(): Promise<PublicStats | null> {
  const res = await fetch(`${config.apiUrl}/stats/public`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}
