import { config } from '@/lib/config';

export interface PublicStats {
  publishedOpportunities: number;
  activeMandates: number;
  countriesWithOpportunities: number;
  /** Normalised to a single currency; listings are priced locally. */
  totalProjectValue: number;
  totalProjectValueCurrency: string;
  totalProjectValueRatesVersion: string;
  /** Listings left out because their currency has no reference rate. */
  totalProjectValueExcluded: number;
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
  try {
    const res = await fetch(`${config.apiUrl}/stats/public`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as PublicStats;
  } catch {
    // Reached during `next build` too, when the API may not be up yet. The
    // landing page already renders without figures, so degrade rather than
    // fail the build.
    return null;
  }
}
