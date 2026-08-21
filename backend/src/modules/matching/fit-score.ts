import { OwnerCategory, RiskLevel } from '@prisma/client';

/**
 * Deterministic, explainable JV Fit Score (spec §2 "JV Fit Score", §16 scores).
 * Pure function — no DB, fully unit-testable. Only factors with data on BOTH
 * sides are scored; the final score is normalized over the applicable weight so
 * missing data neither helps nor unfairly hurts. Every factor returns a reason,
 * so the score is always explainable.
 */

export interface OpportunityLike {
  sector: string;
  countryCode: string;
  investmentRequiredCents: bigint | null;
  structures: string[];
  targetIrr: number | null;
  ownerCategory: OwnerCategory;
  riskLevel: RiskLevel | null;
}

export interface MandateLike {
  sectors: string[];
  countryCodes: string[];
  structures: string[];
  ownerCategories: OwnerCategory[];
  minInvestmentCents: bigint | null;
  maxInvestmentCents: bigint | null;
  targetIrr: number | null;
  riskAppetite: RiskLevel | null;
}

export interface FactorResult {
  key: string;
  label: string;
  weight: number;
  /** 0..1 fit for this factor. */
  score: number;
  /** points awarded out of the final 100 (post-normalization). */
  points: number;
  applicable: boolean;
  detail: string;
}

export interface FitResult {
  score: number; // 0..100
  grade: 'A' | 'B' | 'C' | 'D';
  gradeLabel: string;
  factors: FactorResult[];
  reasons: string[];
}

const RISK_RANK: Record<RiskLevel, number> = { LOW: 1, MODERATE: 2, MEDIUM: 3, HIGH: 4 };

function grade(score: number): { grade: FitResult['grade']; label: string } {
  if (score >= 80) return { grade: 'A', label: 'Strong match' };
  if (score >= 60) return { grade: 'B', label: 'Good match' };
  if (score >= 40) return { grade: 'C', label: 'Partial match' };
  return { grade: 'D', label: 'Weak match' };
}

export function scoreFit(op: OpportunityLike, m: MandateLike): FitResult {
  const raw: Omit<FactorResult, 'points'>[] = [];

  // Sector
  raw.push({
    key: 'sector',
    label: 'Sector',
    weight: 25,
    applicable: m.sectors.length > 0,
    score: m.sectors.includes(op.sector) ? 1 : 0,
    detail: m.sectors.length === 0
      ? 'Mandate has no sector preference'
      : m.sectors.includes(op.sector)
        ? `Sector "${op.sector}" is in the mandate`
        : `Sector "${op.sector}" not in the mandate's sectors`,
  });

  // Country
  raw.push({
    key: 'country',
    label: 'Country',
    weight: 20,
    applicable: m.countryCodes.length > 0,
    score: m.countryCodes.includes(op.countryCode) ? 1 : 0,
    detail: m.countryCodes.length === 0
      ? 'Mandate has no country preference'
      : m.countryCodes.includes(op.countryCode)
        ? `${op.countryCode} is a target country`
        : `${op.countryCode} not in target countries`,
  });

  // Investment fit
  {
    const hasRange = m.minInvestmentCents !== null || m.maxInvestmentCents !== null;
    const applicable = hasRange && op.investmentRequiredCents !== null;
    let score = 0;
    let detail = 'No ticket size on one side';
    if (applicable) {
      const inv = op.investmentRequiredCents as bigint;
      const min = m.minInvestmentCents;
      const max = m.maxInvestmentCents;
      const aboveMin = min === null || inv >= min;
      const belowMax = max === null || inv <= max;
      if (aboveMin && belowMax) {
        score = 1;
        detail = 'Required investment fits the mandate ticket size';
      } else {
        // partial credit by how far outside the band (within 50% → tapered)
        const bound = !aboveMin ? (min as bigint) : (max as bigint);
        const ratio = Number(inv) / Number(bound);
        const distance = Math.abs(1 - ratio);
        score = distance <= 0.5 ? Math.max(0, 1 - distance * 2) : 0;
        detail = !aboveMin ? 'Below the mandate minimum ticket' : 'Above the mandate maximum ticket';
      }
    }
    raw.push({ key: 'investment', label: 'Investment size', weight: 20, applicable, score, detail });
  }

  // Structure overlap
  {
    const applicable = m.structures.length > 0 && op.structures.length > 0;
    const overlap = op.structures.filter((s) => m.structures.includes(s));
    const score = applicable ? overlap.length / m.structures.length : 0;
    raw.push({
      key: 'structures',
      label: 'Deal structures',
      weight: 15,
      applicable,
      score: Math.min(1, score),
      detail: applicable
        ? overlap.length > 0
          ? `Shares ${overlap.length} preferred structure(s)`
          : 'No preferred structures in common'
        : 'No structures specified on one side',
    });
  }

  // IRR fit
  {
    const applicable = m.targetIrr !== null && op.targetIrr !== null;
    let score = 0;
    let detail = 'No target IRR on one side';
    if (applicable) {
      const opIrr = op.targetIrr as number;
      const target = m.targetIrr as number;
      if (target <= 0) score = 1;
      else score = opIrr >= target ? 1 : Math.max(0, opIrr / target);
      detail = opIrr >= target
        ? `Opportunity IRR ${opIrr}% meets target ${target}%`
        : `Opportunity IRR ${opIrr}% below target ${target}%`;
    }
    raw.push({ key: 'irr', label: 'Target return', weight: 10, applicable, score, detail });
  }

  // Owner category
  raw.push({
    key: 'ownerCategory',
    label: 'Owner type',
    weight: 5,
    applicable: m.ownerCategories.length > 0,
    score: m.ownerCategories.includes(op.ownerCategory) ? 1 : 0,
    detail: m.ownerCategories.length === 0
      ? 'No owner-type preference'
      : m.ownerCategories.includes(op.ownerCategory)
        ? `Owner type ${op.ownerCategory} matches`
        : `Owner type ${op.ownerCategory} not preferred`,
  });

  // Risk appetite
  {
    const applicable = m.riskAppetite !== null && op.riskLevel !== null;
    const within = applicable && RISK_RANK[op.riskLevel as RiskLevel] <= RISK_RANK[m.riskAppetite as RiskLevel];
    raw.push({
      key: 'risk',
      label: 'Risk appetite',
      weight: 5,
      applicable,
      score: within ? 1 : 0,
      detail: !applicable
        ? 'Risk not specified on one side'
        : within
          ? 'Risk within appetite'
          : 'Risk exceeds appetite',
    });
  }

  const applicableWeight = raw.filter((f) => f.applicable).reduce((s, f) => s + f.weight, 0);
  const rawScore = raw
    .filter((f) => f.applicable)
    .reduce((s, f) => s + f.weight * f.score, 0);
  const score = applicableWeight > 0 ? Math.round((rawScore / applicableWeight) * 100) : 0;

  const factors: FactorResult[] = raw.map((f) => ({
    ...f,
    points: applicableWeight > 0 && f.applicable
      ? Math.round((f.weight * f.score) / applicableWeight * 100)
      : 0,
  }));

  const g = grade(score);
  const reasons = factors
    .filter((f) => f.applicable && f.score >= 0.5)
    .sort((a, b) => b.points - a.points)
    .map((f) => f.detail);

  return { score, grade: g.grade, gradeLabel: g.label, factors, reasons };
}
