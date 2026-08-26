/**
 * Deterministic, explainable JV/PPP structure recommender (spec §6). Pure
 * functions, no AI. Each structure carries capability tags; the recommender
 * derives the desired tags from the opportunity profile, scores every structure
 * by how many weighted desires it satisfies, and returns a ranked, explained list.
 */

export const RECOMMENDER_VERSION = 'structure-recommender-1.0.0';

export type OwnerType = 'PRIVATE' | 'SEMI_GOVERNMENT' | 'GOVERNMENT';
export type Level = 'low' | 'medium' | 'high';

export interface RecommenderInputs {
  ownerType: OwnerType;
  landOwnershipRetained?: boolean; // owner wants to keep title
  financingRequired?: boolean; // needs private finance
  userPay?: boolean; // asset can charge users
  governmentPay?: boolean; // government can make availability payments
  revenueCertainty?: Level;
  transferRequired?: boolean; // asset must revert/transfer to a public owner
  concessionTermYears?: number;
  riskAppetite?: Level;
}

interface StructureProfile {
  code: string;
  label: string;
  category: 'private' | 'ppp' | 'concession' | 'construction';
  tags: string[];
}

/** Curated capability tags per structure (representative of the library). */
export const STRUCTURE_PROFILES: StructureProfile[] = [
  { code: 'gfa-share-jv', label: 'GFA Share JV', category: 'private', tags: ['private', 'owner-retains-title', 'sales-revenue', 'no-finance', 'no-revert'] },
  { code: 'jda', label: 'Joint Development Agreement', category: 'private', tags: ['private', 'owner-retains-title', 'sales-revenue', 'revenue-share', 'no-revert'] },
  { code: 'gross-revenue-jv', label: 'Gross Revenue JV', category: 'private', tags: ['private', 'owner-retains-title', 'revenue-share', 'no-revert'] },
  { code: 'net-profit-jv', label: 'Net Profit JV', category: 'private', tags: ['private', 'equity', 'revenue-share', 'high-risk'] },
  { code: 'spv', label: 'Land-as-Equity SPV', category: 'private', tags: ['private', 'public', 'transfers-title', 'equity', 'private-finance', 'high-risk'] },
  { code: 'musataha', label: 'Musataha', category: 'private', tags: ['private', 'owner-retains-title', 'rent', 'reverts', 'long-term'] },
  { code: 'long-term-lease', label: 'Long-Term Lease', category: 'private', tags: ['private', 'public', 'owner-retains-title', 'rent', 'reverts', 'long-term', 'low-risk'] },
  { code: 'fixed-land-price', label: 'Fixed Land Price', category: 'private', tags: ['private', 'transfers-title', 'low-risk', 'no-revert'] },
  { code: 'bot', label: 'BOT', category: 'ppp', tags: ['public', 'private-finance', 'user-pay', 'reverts', 'long-term', 'high-risk'] },
  { code: 'boot', label: 'BOOT', category: 'ppp', tags: ['public', 'private-finance', 'user-pay', 'reverts', 'long-term'] },
  { code: 'boo', label: 'BOO', category: 'ppp', tags: ['public', 'private-finance', 'user-pay', 'no-revert', 'high-risk'] },
  { code: 'bto', label: 'BTO', category: 'ppp', tags: ['public', 'private-finance', 'reverts', 'long-term'] },
  { code: 'dbfo', label: 'DBFO', category: 'ppp', tags: ['public', 'private-finance', 'government-pay', 'reverts', 'long-term', 'low-risk'] },
  { code: 'dbfom', label: 'DBFOM', category: 'ppp', tags: ['public', 'private-finance', 'government-pay', 'reverts', 'long-term'] },
  { code: 'availability-payment', label: 'Availability Payment', category: 'ppp', tags: ['public', 'government-pay', 'reverts', 'low-risk', 'long-term'] },
  { code: 'concession', label: 'Concession', category: 'concession', tags: ['public', 'private-finance', 'user-pay', 'reverts', 'long-term'] },
  { code: 'design-build', label: 'Design-Build', category: 'construction', tags: ['public', 'private', 'no-finance', 'short-term', 'low-risk'] },
  { code: 'epc', label: 'EPC', category: 'construction', tags: ['public', 'private', 'no-finance', 'short-term', 'low-risk'] },
];

interface Desire {
  tag: string;
  weight: number;
  reason: string;
}

export function deriveDesires(i: RecommenderInputs): Desire[] {
  const d: Desire[] = [];
  // Public / private
  if (i.ownerType === 'PRIVATE') d.push({ tag: 'private', weight: 20, reason: 'Suits a private landowner' });
  else d.push({ tag: 'public', weight: 20, reason: 'Suits a public/semi-government owner' });

  // Ownership retention
  if (i.landOwnershipRetained) d.push({ tag: 'owner-retains-title', weight: 18, reason: 'Lets the owner keep title' });
  else d.push({ tag: 'transfers-title', weight: 8, reason: 'Owner is willing to transfer title' });

  // Financing
  if (i.financingRequired) d.push({ tag: 'private-finance', weight: 15, reason: 'Brings private finance' });
  else d.push({ tag: 'no-finance', weight: 6, reason: 'No external finance needed' });

  // Revenue model
  if (i.userPay) d.push({ tag: 'user-pay', weight: 12, reason: 'Can charge end users' });
  if (i.governmentPay) d.push({ tag: 'government-pay', weight: 12, reason: 'Government availability payments possible' });
  if (i.revenueCertainty === 'high') d.push({ tag: 'sales-revenue', weight: 10, reason: 'High revenue certainty favours sales-based returns' });
  if (i.revenueCertainty === 'low') d.push({ tag: 'rent', weight: 8, reason: 'Low revenue certainty favours rent/availability income' });

  // Transfer
  if (i.transferRequired) d.push({ tag: 'reverts', weight: 10, reason: 'Asset must revert to the public owner' });
  else d.push({ tag: 'no-revert', weight: 6, reason: 'No reversion required' });

  // Term
  if ((i.concessionTermYears ?? 0) > 0) d.push({ tag: 'long-term', weight: 8, reason: 'A long concession term applies' });

  // Risk
  if (i.riskAppetite === 'high') d.push({ tag: 'high-risk', weight: 7, reason: 'High risk appetite suits equity-style upside' });
  if (i.riskAppetite === 'low') d.push({ tag: 'low-risk', weight: 7, reason: 'Low risk appetite suits fixed/availability returns' });

  return d;
}

export interface StructureScore {
  code: string;
  label: string;
  category: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  reasons: string[];
}

export interface RecommendationResult {
  version: string;
  recommended: StructureScore | null;
  alternatives: StructureScore[];
  ranked: StructureScore[];
}

function grade(score: number): StructureScore['grade'] {
  if (score >= 75) return 'A';
  if (score >= 55) return 'B';
  if (score >= 35) return 'C';
  return 'D';
}

export function recommendStructures(inputs: RecommenderInputs): RecommendationResult {
  const desires = deriveDesires(inputs);
  const totalWeight = desires.reduce((s, x) => s + x.weight, 0);

  const ranked = STRUCTURE_PROFILES.map((st) => {
    const matched = desires.filter((d) => st.tags.includes(d.tag));
    const raw = matched.reduce((s, m) => s + m.weight, 0);
    const score = totalWeight > 0 ? Math.round((raw / totalWeight) * 100) : 0;
    return {
      code: st.code,
      label: st.label,
      category: st.category,
      score,
      grade: grade(score),
      reasons: matched.sort((a, b) => b.weight - a.weight).map((m) => m.reason),
    };
  }).sort((a, b) => b.score - a.score);

  return {
    version: RECOMMENDER_VERSION,
    recommended: ranked[0] ?? null,
    alternatives: ranked.slice(1, 4),
    ranked,
  };
}
