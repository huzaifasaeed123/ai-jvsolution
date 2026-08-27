/**
 * Deterministic, explainable offer comparison (spec §25). Pure functions.
 * Each criterion is min-max normalized across the offer set (respecting whether
 * higher or lower is better), then combined with owner-defined weights into a
 * 0-100 score. Missing values are treated as the worst in the set.
 */

export const COMPARISON_VERSION = 'offer-comparison-1.0.0';

export interface CompareOfferInput {
  offerId: string;
  submittedByName: string;
  ownerSharePct: number | null;
  investmentAmount: number | null;
  experienceYears: number | null;
  financialCapacity: number | null;
  developmentMonths: number | null;
  hasGuarantees: boolean;
}

interface Criterion {
  key: string;
  label: string;
  higherBetter: boolean;
  get: (o: CompareOfferInput) => number | null;
  defaultWeight: number;
}

const CRITERIA: Criterion[] = [
  { key: 'ownerReturn', label: 'Owner return', higherBetter: true, get: (o) => o.ownerSharePct, defaultWeight: 0.35 },
  { key: 'experience', label: 'Experience', higherBetter: true, get: (o) => o.experienceYears, defaultWeight: 0.15 },
  { key: 'financialCapacity', label: 'Financial capacity', higherBetter: true, get: (o) => o.financialCapacity, defaultWeight: 0.15 },
  { key: 'delivery', label: 'Delivery speed', higherBetter: false, get: (o) => o.developmentMonths, defaultWeight: 0.15 },
  { key: 'investment', label: 'Investment', higherBetter: true, get: (o) => o.investmentAmount, defaultWeight: 0.1 },
  { key: 'guarantees', label: 'Guarantees', higherBetter: true, get: (o) => (o.hasGuarantees ? 1 : 0), defaultWeight: 0.1 },
];

export interface CriterionScore {
  key: string;
  label: string;
  weight: number;
  normalized: number; // 0..1
  points: number; // contribution to the 0..100 total
}

export interface OfferComparisonResult {
  offerId: string;
  submittedByName: string;
  score: number; // 0..100
  grade: 'A' | 'B' | 'C' | 'D';
  criteria: CriterionScore[];
  reasons: string[];
}

export interface ComparisonOutput {
  version: string;
  weights: Record<string, number>;
  criteria: { key: string; label: string }[];
  ranked: OfferComparisonResult[];
  recommendedOfferId: string | null;
}

function grade(score: number): OfferComparisonResult['grade'] {
  if (score >= 75) return 'A';
  if (score >= 55) return 'B';
  if (score >= 35) return 'C';
  return 'D';
}

/** Normalize owner-supplied weights to sum to 1; fall back to defaults. */
function resolveWeights(input?: Record<string, number>): Record<string, number> {
  const raw: Record<string, number> = {};
  let total = 0;
  for (const c of CRITERIA) {
    const w = input && Number.isFinite(input[c.key]) ? Math.max(0, input[c.key]) : c.defaultWeight;
    raw[c.key] = w;
    total += w;
  }
  if (total <= 0) {
    for (const c of CRITERIA) raw[c.key] = c.defaultWeight;
    total = CRITERIA.reduce((s, c) => s + c.defaultWeight, 0);
  }
  const norm: Record<string, number> = {};
  for (const c of CRITERIA) norm[c.key] = raw[c.key] / total;
  return norm;
}

export function compareOffers(
  offers: CompareOfferInput[],
  weightsInput?: Record<string, number>,
): ComparisonOutput {
  const weights = resolveWeights(weightsInput);

  // Per-criterion min/max (nulls excluded; if all null, criterion is neutral).
  const stats: Record<string, { min: number; max: number; worst: number }> = {};
  for (const c of CRITERIA) {
    const vals = offers.map((o) => c.get(o)).filter((v): v is number => v !== null);
    if (vals.length === 0) { stats[c.key] = { min: 0, max: 0, worst: 0 }; continue; }
    const min = Math.min(...vals), max = Math.max(...vals);
    stats[c.key] = { min, max, worst: c.higherBetter ? min : max };
  }

  const ranked: OfferComparisonResult[] = offers.map((o) => {
    const criteria: CriterionScore[] = CRITERIA.map((c) => {
      const { min, max, worst } = stats[c.key];
      const raw = c.get(o);
      const v = raw === null ? worst : raw;
      let normalized: number;
      if (max === min) normalized = 0.5;
      else normalized = c.higherBetter ? (v - min) / (max - min) : (max - v) / (max - min);
      return { key: c.key, label: c.label, weight: weights[c.key], normalized, points: 0 };
    });
    const scoreRaw = criteria.reduce((s, cs) => s + cs.weight * cs.normalized, 0);
    const score = Math.round(scoreRaw * 100);
    criteria.forEach((cs) => { cs.points = Math.round(cs.weight * cs.normalized * 100); });
    const reasons = criteria
      .filter((cs) => cs.normalized >= 0.8 && cs.weight > 0)
      .sort((a, b) => b.points - a.points)
      .map((cs) => `Leads on ${cs.label.toLowerCase()}`);
    return { offerId: o.offerId, submittedByName: o.submittedByName, score, grade: grade(score), criteria, reasons };
  }).sort((a, b) => b.score - a.score);

  return {
    version: COMPARISON_VERSION,
    weights,
    criteria: CRITERIA.map((c) => ({ key: c.key, label: c.label })),
    ranked,
    recommendedOfferId: ranked[0]?.offerId ?? null,
  };
}
