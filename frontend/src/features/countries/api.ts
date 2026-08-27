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

/** Public, cacheable — country intelligence is static editorial content. */
export async function listCountries(): Promise<CountrySummary[]> {
  const res = await fetch(`${config.apiUrl}/countries`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getCountry(code: string): Promise<CountryDetail | null> {
  const res = await fetch(`${config.apiUrl}/countries/${code}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}
