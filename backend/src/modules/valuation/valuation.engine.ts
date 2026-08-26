/**
 * Deterministic valuation engine (spec §9). Four independent methods, each a
 * pure function: residual land value, comparable-sales, income-capitalisation
 * and DCF. No AI, fully unit-testable. Money in whole currency units.
 */

export const VALUATION_FORMULA_VERSION = 'valuation-1.0.0';

export type ValuationMethod = 'residual' | 'comparable' | 'income' | 'dcf';

export interface ValuationResult {
  method: ValuationMethod;
  value: number;
  low: number | null;
  high: number | null;
  perSqm: number | null;
  breakdown: Record<string, number>;
}

// ---- Residual land value ----
export interface ResidualInputs {
  gfaSqm: number;
  efficiencyPct?: number; // default 80
  salePricePerSqm: number;
  constructionCostPerSqm: number;
  professionalFeesPct?: number; // default 8
  contingencyPct?: number; // default 5
  marketingPct?: number; // default 3
  sellingCostsPct?: number; // default 2
  financeRatePct?: number; // default 8
  developmentMonths?: number; // default 24
  debtRatioPct?: number; // default 60 (on build only, for residual)
  requiredProfitOnCostPct?: number; // developer's required profit, default 20
}

export function computeResidual(i: ResidualInputs): ValuationResult {
  const eff = i.efficiencyPct ?? 80;
  const feesPct = i.professionalFeesPct ?? 8;
  const contPct = i.contingencyPct ?? 5;
  const mktPct = i.marketingPct ?? 3;
  const sellPct = i.sellingCostsPct ?? 2;
  const finRate = i.financeRatePct ?? 8;
  const months = i.developmentMonths ?? 24;
  const debtPct = i.debtRatioPct ?? 60;
  const reqProfitPct = i.requiredProfitOnCostPct ?? 20;

  const nsa = i.gfaSqm * (eff / 100);
  const gdv = nsa * i.salePricePerSqm;
  const construction = i.gfaSqm * i.constructionCostPerSqm;
  const fees = construction * (feesPct / 100);
  const contingency = (construction + fees) * (contPct / 100);
  const hardSoft = construction + fees + contingency;
  const marketing = gdv * (mktPct / 100);
  const selling = gdv * (sellPct / 100);
  // Finance on the build only (land is the unknown), average drawdown 0.6.
  const financeCost = hardSoft * (debtPct / 100) * (finRate / 100) * (months / 12) * 0.6;
  const nonLandCost = hardSoft + marketing + selling + financeCost;
  const requiredProfit = nonLandCost * (reqProfitPct / 100);
  const residual = gdv - nonLandCost - requiredProfit;

  return {
    method: 'residual',
    value: round(residual),
    low: round(residual * 0.9),
    high: round(residual * 1.1),
    perSqm: i.gfaSqm > 0 ? round(residual / i.gfaSqm) : null,
    breakdown: {
      gdv: round(gdv),
      construction: round(construction),
      professionalFees: round(fees),
      contingency: round(contingency),
      marketing: round(marketing),
      sellingCosts: round(selling),
      financeCost: round(financeCost),
      requiredProfit: round(requiredProfit),
      residualLandValue: round(residual),
    },
  };
}

// ---- Comparable sales ----
export interface ComparableInputs {
  comparables: number[]; // price per sqm
  areaSqm: number;
  adjustmentPct?: number; // net adjustment vs comps, default 0
}

export function computeComparable(i: ComparableInputs): ValuationResult {
  const comps = i.comparables.filter((c) => Number.isFinite(c) && c > 0);
  const avg = comps.reduce((a, b) => a + b, 0) / comps.length;
  const adj = i.adjustmentPct ?? 0;
  const adjusted = avg * (1 + adj / 100);
  const value = adjusted * i.areaSqm;
  const low = Math.min(...comps) * (1 + adj / 100) * i.areaSqm;
  const high = Math.max(...comps) * (1 + adj / 100) * i.areaSqm;
  return {
    method: 'comparable',
    value: round(value),
    low: round(low),
    high: round(high),
    perSqm: round(adjusted),
    breakdown: {
      averagePricePerSqm: round(avg),
      adjustedPricePerSqm: round(adjusted),
      areaSqm: i.areaSqm,
      value: round(value),
    },
  };
}

// ---- Income capitalisation ----
export interface IncomeInputs {
  annualRentPerSqm: number;
  leasableAreaSqm: number;
  occupancyPct?: number; // default 90
  opexPct?: number; // of gross rent, default 25
  capRatePct: number;
}

export function computeIncome(i: IncomeInputs): ValuationResult {
  const occ = i.occupancyPct ?? 90;
  const opexPct = i.opexPct ?? 25;
  const grossRent = i.annualRentPerSqm * i.leasableAreaSqm;
  const effectiveRent = grossRent * (occ / 100);
  const noi = effectiveRent * (1 - opexPct / 100);
  const value = i.capRatePct > 0 ? noi / (i.capRatePct / 100) : 0;
  return {
    method: 'income',
    value: round(value),
    low: i.capRatePct > 0 ? round(noi / ((i.capRatePct + 0.5) / 100)) : null,
    high: i.capRatePct > 0 ? round(noi / ((i.capRatePct - 0.5) / 100)) : null,
    perSqm: i.leasableAreaSqm > 0 ? round(value / i.leasableAreaSqm) : null,
    breakdown: {
      grossRent: round(grossRent),
      effectiveRent: round(effectiveRent),
      noi: round(noi),
      capRatePct: i.capRatePct,
      value: round(value),
    },
  };
}

// ---- DCF ----
export interface DcfInputs {
  cashflows: number[]; // annual net cash flows, year 1..n
  discountRatePct: number;
  terminalValue?: number; // optional lump at final year
}

export function computeDcf(i: DcfInputs): ValuationResult {
  const r = i.discountRatePct / 100;
  let npv = 0;
  i.cashflows.forEach((cf, idx) => {
    npv += cf / Math.pow(1 + r, idx + 1);
  });
  const n = i.cashflows.length;
  const terminalPv = i.terminalValue ? i.terminalValue / Math.pow(1 + r, n) : 0;
  const value = npv + terminalPv;
  return {
    method: 'dcf',
    value: round(value),
    low: round(value * 0.9),
    high: round(value * 1.1),
    perSqm: null,
    breakdown: {
      pvOfCashflows: round(npv),
      pvOfTerminal: round(terminalPv),
      value: round(value),
    },
  };
}

function round(n: number): number {
  return Math.round(n);
}
