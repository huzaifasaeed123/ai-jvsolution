import { config } from '@/lib/config';

export interface CountrySummary {
  code: string;
  name: string;
  flag: string;
  region: string;
  currency: string;
  tagline: string;
  ownerShareRange: { low: number; high: number };
  commonStructures: string[];
}

export interface CountryDetail extends CountrySummary {
  overview: string;
  buildCostPerSqm: { low: number; high: number };
  salePricePerSqm: { low: number; high: number };
  foreignOwnership: string;
  titleSystem: string;
  authorities: string[];
  considerations: string[];
  dataAsOf: string;
}

/**
 * Public, cacheable — country intelligence is static editorial content.
 *
 * These run during `next build` as well as at request time, and at build time
 * the API may legitimately be unreachable: it may not be deployed yet, or its
 * certificate may not have been issued. A thrown fetch there fails the whole
 * build, so the network error is caught and the page falls back to empty rather
 * than taking the deployment down with it.
 */
export async function listCountries(): Promise<CountrySummary[]> {
  try {
    const res = await fetch(`${config.apiUrl}/countries`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()) as CountrySummary[];
  } catch {
    return [];
  }
}

export async function getCountry(code: string): Promise<CountryDetail | null> {
  try {
    const res = await fetch(`${config.apiUrl}/countries/${code}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CountryDetail;
  } catch {
    return null;
  }
}
