import { config } from '@/lib/config';

export interface StructureEntry {
  code: string;
  label: string;
  group: string;
  mechanism: string;
  ownerReceives: string;
  riskProfile: string;
  bestFor: string;
}

export interface StructureGroup {
  code: string;
  label: string;
  blurb: string;
  entries: StructureEntry[];
}

export interface StructureLibrary {
  groups: StructureGroup[];
  documented: number;
  totalSupported: number;
}

/** Public, cacheable — static editorial content. */
export async function getStructureLibrary(): Promise<StructureLibrary | null> {
  const res = await fetch(`${config.apiUrl}/structures`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}
