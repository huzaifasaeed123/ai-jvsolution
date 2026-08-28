/**
 * Deterministic tender evaluation (spec §13). Bids are scored against the
 * criteria the authority PUBLISHED UP FRONT with the tender — the scoring rule
 * cannot be invented after bids are opened, which is what makes the award
 * defensible.
 *
 * Two kinds of criterion:
 *  - objective: derived from bid data, min-max normalized across the field
 *    (direction-aware — lower price is better, more experience is better)
 *  - subjective: the authority enters a 0-100 score (e.g. technical quality),
 *    which is recorded and audited alongside the objective ones.
 */

export const EVALUATION_VERSION = 'bid-evaluation-1.0.0';

export interface EvaluationCriterion {
  key: string;
  label: string;
  weight: number;
}

export interface EvaluableBid {
  bidId: string;
  reference: string;
  bidderName: string;
  status: string;
  bidPrice: number | null;
  annualPayment: number | null;
  revenueSharePct: number | null;
  deliveryMonths: number | null;
  experienceYears: number | null;
  financialCapacity: number | null;
  localContentPct: number | null;
  /** Authority-entered manual scores (0-100) keyed by criterion. */
  manualScores?: Record<string, number>;
}

/** How a known criterion key maps onto bid data, and which direction is better. */
const OBJECTIVE: Record<string, { get: (b: EvaluableBid) => number | null; higherBetter: boolean }> = {
  financial: { get: (b) => b.bidPrice, higherBetter: false }, // lower price wins
  price: { get: (b) => b.bidPrice, higherBetter: false },
  annualPayment: { get: (b) => b.annualPayment, higherBetter: false },
  revenueShare: { get: (b) => b.revenueSharePct, higherBetter: true },
  delivery: { get: (b) => b.deliveryMonths, higherBetter: false }, // faster wins
  experience: { get: (b) => b.experienceYears, higherBetter: true },
  financialCapacity: { get: (b) => b.financialCapacity, higherBetter: true },
  localContent: { get: (b) => b.localContentPct, higherBetter: true },
};

export interface CriterionResult {
  key: string;
  label: string;
  weight: number;
  /** 0..1 after normalization. */
  normalized: number;
  points: number;
  source: 'objective' | 'manual' | 'unscored';
}

export interface BidEvaluation {
  bidId: string;
  reference: string;
  bidderName: string;
  score: number; // 0..100
  rank: number;
  criteria: CriterionResult[];
  notes: string[];
}

export interface EvaluationOutput {
  version: string;
  criteria: EvaluationCriterion[];
  evaluated: BidEvaluation[];
  /** Highest-scoring compliant bid, or null when nothing is evaluable. */
  recommendedBidId: string | null;
}

/** Bids excluded from the field entirely. */
const EXCLUDED = ['DRAFT', 'WITHDRAWN', 'DISQUALIFIED'];

export function evaluateBids(
  bids: EvaluableBid[],
  criteria: EvaluationCriterion[],
): EvaluationOutput {
  const field = bids.filter((b) => !EXCLUDED.includes(b.status));
  const totalWeight = criteria.reduce((s, c) => s + Math.max(0, c.weight), 0);

  // Per-criterion min/max across the field, for objective normalization.
  const stats: Record<string, { min: number; max: number; worst: number }> = {};
  for (const c of criteria) {
    const spec = OBJECTIVE[c.key];
    if (!spec) continue;
    const vals = field.map((b) => spec.get(b)).filter((v): v is number => v !== null);
    if (!vals.length) continue;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    stats[c.key] = { min, max, worst: spec.higherBetter ? min : max };
  }

  const evaluated = field
    .map((b) => {
      const notes: string[] = [];
      const results: CriterionResult[] = criteria.map((c) => {
        const weight = Math.max(0, c.weight);
        const manual = b.manualScores?.[c.key];
        const spec = OBJECTIVE[c.key];
        const stat = stats[c.key];

        // A manual score always wins — the authority has judged it directly.
        if (typeof manual === 'number' && Number.isFinite(manual)) {
          const normalized = Math.min(1, Math.max(0, manual / 100));
          return { key: c.key, label: c.label, weight, normalized, points: 0, source: 'manual' };
        }

        if (spec && stat) {
          const raw = spec.get(b);
          const v = raw === null ? stat.worst : raw;
          if (raw === null) notes.push(`No value supplied for ${c.label.toLowerCase()}`);
          const { min, max } = stat;
          const normalized =
            max === min ? 0.5 : spec.higherBetter ? (v - min) / (max - min) : (max - v) / (max - min);
          return { key: c.key, label: c.label, weight, normalized, points: 0, source: 'objective' };
        }

        // Subjective criterion with no manual score yet — contributes nothing.
        notes.push(`${c.label} not yet scored`);
        return { key: c.key, label: c.label, weight, normalized: 0, points: 0, source: 'unscored' };
      });

      const raw = results.reduce((s, r) => s + r.weight * r.normalized, 0);
      const score = totalWeight > 0 ? Math.round((raw / totalWeight) * 100) : 0;
      results.forEach((r) => {
        r.points = totalWeight > 0 ? Math.round(((r.weight * r.normalized) / totalWeight) * 100) : 0;
      });

      return { bidId: b.bidId, reference: b.reference, bidderName: b.bidderName, score, rank: 0, criteria: results, notes };
    })
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  return {
    version: EVALUATION_VERSION,
    criteria,
    evaluated,
    recommendedBidId: evaluated[0]?.bidId ?? null,
  };
}
