/**
 * Investor dashboard builder (spec §16). Pure function: takes aggregated raw
 * data from across the platform and produces KPI cards, 0-100 readiness scores
 * and chart series. No DB, fully unit-testable.
 */

export interface FeasibilitySnapshot {
  currency: string;
  gdv: number;
  equity: number;
  debt: number;
  netProfit: number;
  profitOnCost: number;
  projectIrr: number;
  npv: number;
  paybackMonths: number;
  ltc: number;
  ltv: number;
  roe: number;
  landCost: number;
  construction: number;
  professionalFees: number;
  contingency: number;
  marketing: number;
  sellingCosts: number;
  financeCost: number;
  breakEvenSalePricePerSqm: number;
  viabilityScore: number;
  developmentMonths?: number;
}

export interface IndicatorsInput {
  opportunity: {
    reference: string;
    title: string;
    sector: string;
    countryCode: string;
    ownerCategory: string;
    status: string;
    verification: string; // T0..T5
    permitStatus: string; // NONE/PRELIMINARY/IN_PROGRESS/APPROVED
    currency: string;
  };
  feasibility: FeasibilitySnapshot | null;
  offers: { status: string; ownerSharePct: number | null; investmentAmount: number | null }[];
  dataRoom: { totalFolders: number; foldersWithDocs: number; documentCount: number };
  dueDiligence: { total: number; closed: number; byRisk: Record<string, number> };
}

const VERIFICATION_SCORE: Record<string, number> = { T0: 0, T1: 20, T2: 40, T3: 60, T4: 80, T5: 100 };
const PERMIT_SCORE: Record<string, number> = { NONE: 0, PRELIMINARY: 33, IN_PROGRESS: 66, APPROVED: 100 };

function financingScore(offers: IndicatorsInput['offers']): number {
  if (offers.some((o) => o.status === 'ACCEPTED')) return 100;
  if (offers.some((o) => o.status === 'SHORTLISTED')) return 70;
  if (offers.some((o) => o.status !== 'WITHDRAWN' && o.status !== 'REJECTED')) return 40;
  return 0;
}

export function buildIndicators(input: IndicatorsInput) {
  const f = input.feasibility;
  const ccy = f?.currency ?? input.opportunity.currency;

  const dataRoom =
    input.dataRoom.totalFolders > 0
      ? Math.round((input.dataRoom.foldersWithDocs / input.dataRoom.totalFolders) * 100)
      : 0;
  const dueDiligence =
    input.dueDiligence.total > 0
      ? Math.round((input.dueDiligence.closed / input.dueDiligence.total) * 100)
      : 0;
  const verification = VERIFICATION_SCORE[input.opportunity.verification] ?? 0;
  const financing = financingScore(input.offers);
  const permits = PERMIT_SCORE[input.opportunity.permitStatus] ?? 0;

  const readinessScores = { dataRoom, dueDiligence, verification, financing, permits };
  const overall = Math.round(
    Object.values(readinessScores).reduce((s, v) => s + v, 0) / Object.keys(readinessScores).length,
  );

  // Bankability & attractiveness blend deal quality (feasibility) with readiness.
  const viability = f?.viabilityScore ?? 0;
  const bankability = Math.round(0.4 * viability + 0.2 * financing + 0.2 * verification + 0.2 * dueDiligence);
  const investmentAttractiveness = Math.round(0.5 * viability + 0.25 * overall + 0.25 * financing);

  const activeOffers = input.offers.filter((o) => o.status !== 'WITHDRAWN' && o.status !== 'REJECTED');
  const byStatus: Record<string, number> = {};
  for (const o of input.offers) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

  const kpis = f
    ? {
        currency: ccy,
        projectValue: f.gdv,
        requiredEquity: f.equity,
        requiredDebt: f.debt,
        revenue: f.gdv,
        netProfit: f.netProfit,
        projectIrr: f.projectIrr,
        npv: f.npv,
        paybackMonths: f.paybackMonths,
        ltc: f.ltc,
        ltv: f.ltv,
        roe: f.roe,
        breakEven: f.breakEvenSalePricePerSqm,
        developmentMonths: f.developmentMonths ?? null,
      }
    : null;

  const charts = {
    sourcesAndUses: f
      ? [
          { name: 'Equity', value: f.equity },
          { name: 'Debt', value: f.debt },
        ]
      : [],
    costComposition: f
      ? [
          { name: 'Land', value: f.landCost },
          { name: 'Construction', value: f.construction },
          { name: 'Fees', value: f.professionalFees },
          { name: 'Contingency', value: f.contingency },
          { name: 'Marketing', value: f.marketing },
          { name: 'Selling', value: f.sellingCosts },
          { name: 'Finance', value: f.financeCost },
        ].filter((c) => c.value > 0)
      : [],
    returnComparison: f
      ? [
          { name: 'Profit on cost', value: Math.round(f.profitOnCost * 100) },
          { name: 'Project IRR', value: Math.round(f.projectIrr * 100) },
          { name: 'ROE', value: Math.round(f.roe * 100) },
        ]
      : [],
    readiness: [
      { name: 'Data room', value: dataRoom },
      { name: 'Due diligence', value: dueDiligence },
      { name: 'Verification', value: verification },
      { name: 'Financing', value: financing },
      { name: 'Permits', value: permits },
    ],
  };

  return {
    opportunity: input.opportunity,
    hasFeasibility: !!f,
    kpis,
    scores: { ...readinessScores, overall, bankability, investmentAttractiveness },
    offers: {
      count: activeOffers.length,
      byStatus,
      bestOwnerSharePct: activeOffers.reduce<number | null>((best, o) => (o.ownerSharePct != null && (best === null || o.ownerSharePct > best) ? o.ownerSharePct : best), null),
      currency: ccy,
    },
    dueDiligence: input.dueDiligence,
    charts,
  };
}
