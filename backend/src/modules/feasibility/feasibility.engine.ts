/**
 * Deterministic real-estate feasibility engine (spec §7). Pure functions — no
 * DB, no AI, fully unit-testable. Every run records its formula version and the
 * assumptions used so results are reproducible and auditable (spec §42).
 *
 * Money values are in whole currency units (major units). This is analytical
 * modelling, not a stored money ledger.
 */

export const FEASIBILITY_FORMULA_VERSION = 'feasibility-1.0.0';

export interface FeasibilityInputs {
  currency?: string;
  gfaSqm: number;
  efficiencyPct?: number; // NSA / GFA, default 80
  salePricePerSqm: number; // on NSA
  constructionCostPerSqm: number; // on GFA
  landCost: number;
  professionalFeesPct?: number; // of construction, default 8
  contingencyPct?: number; // of construction+fees, default 5
  marketingPct?: number; // of GDV, default 3
  sellingCostsPct?: number; // of GDV, default 2
  developmentMonths?: number; // default 24
  debtRatioPct?: number; // LTC on land+build, default 60
  financeRatePct?: number; // annual, default 8
  discountRatePct?: number; // for NPV, default 12
}

export interface ScenarioResult {
  name: string;
  netProfit: number;
  profitOnCost: number;
  projectIrr: number;
}

export interface FeasibilityOutputs {
  currency: string;
  nsaSqm: number;
  gdv: number;
  construction: number;
  professionalFees: number;
  contingency: number;
  marketing: number;
  sellingCosts: number;
  landCost: number;
  financeCost: number;
  totalProjectCost: number;
  grossProfit: number;
  netProfit: number;
  profitOnCost: number; // margin on cost
  profitOnGdv: number; // margin on revenue
  equity: number;
  debt: number;
  ltc: number;
  ltv: number;
  roe: number;
  projectIrr: number; // annualized, unlevered
  npv: number;
  paybackMonths: number;
  breakEvenSalePricePerSqm: number;
  viabilityScore: number; // 0..100
  scenarios: ScenarioResult[];
}

const DEFAULTS = {
  efficiencyPct: 80,
  professionalFeesPct: 8,
  contingencyPct: 5,
  marketingPct: 3,
  sellingCostsPct: 2,
  developmentMonths: 24,
  debtRatioPct: 60,
  financeRatePct: 8,
  discountRatePct: 12,
  drawdownFactor: 0.6, // average finance drawdown over the build
};

export function resolvedAssumptions(inputs: FeasibilityInputs) {
  return {
    efficiencyPct: inputs.efficiencyPct ?? DEFAULTS.efficiencyPct,
    professionalFeesPct: inputs.professionalFeesPct ?? DEFAULTS.professionalFeesPct,
    contingencyPct: inputs.contingencyPct ?? DEFAULTS.contingencyPct,
    marketingPct: inputs.marketingPct ?? DEFAULTS.marketingPct,
    sellingCostsPct: inputs.sellingCostsPct ?? DEFAULTS.sellingCostsPct,
    developmentMonths: inputs.developmentMonths ?? DEFAULTS.developmentMonths,
    debtRatioPct: inputs.debtRatioPct ?? DEFAULTS.debtRatioPct,
    financeRatePct: inputs.financeRatePct ?? DEFAULTS.financeRatePct,
    discountRatePct: inputs.discountRatePct ?? DEFAULTS.discountRatePct,
    drawdownFactor: DEFAULTS.drawdownFactor,
    revenueTiming: 'received at practical completion',
    formulaVersion: FEASIBILITY_FORMULA_VERSION,
  };
}

/** Internal Rate of Return of a monthly cashflow, annualized. Bisection. */
export function irr(monthlyCashflows: number[]): number {
  const npvAt = (rate: number) =>
    monthlyCashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
  // No sign change → undefined; return 0.
  const hasOut = monthlyCashflows.some((c) => c < 0);
  const hasIn = monthlyCashflows.some((c) => c > 0);
  if (!hasOut || !hasIn) return 0;

  let lo = -0.9;
  let hi = 1.0;
  let fLo = npvAt(lo);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npvAt(mid);
    if (Math.abs(fMid) < 1e-6) {
      return Math.pow(1 + mid, 12) - 1;
    }
    if (fLo * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return Math.pow(1 + (lo + hi) / 2, 12) - 1;
}

function core(inputs: FeasibilityInputs) {
  const a = resolvedAssumptions(inputs);
  const nsaSqm = inputs.gfaSqm * (a.efficiencyPct / 100);
  const gdv = nsaSqm * inputs.salePricePerSqm;
  const construction = inputs.gfaSqm * inputs.constructionCostPerSqm;
  const professionalFees = construction * (a.professionalFeesPct / 100);
  const contingency = (construction + professionalFees) * (a.contingencyPct / 100);
  const hardSoft = construction + professionalFees + contingency;
  const marketing = gdv * (a.marketingPct / 100);
  const sellingCosts = gdv * (a.sellingCostsPct / 100);

  const debt = (inputs.landCost + hardSoft) * (a.debtRatioPct / 100);
  const financeCost =
    debt * (a.financeRatePct / 100) * (a.developmentMonths / 12) * a.drawdownFactor;

  const totalProjectCost = inputs.landCost + hardSoft + marketing + sellingCosts + financeCost;
  const netProfit = gdv - totalProjectCost;
  const grossProfit = gdv - hardSoft - marketing - sellingCosts;
  const profitOnCost = totalProjectCost > 0 ? netProfit / totalProjectCost : 0;
  const profitOnGdv = gdv > 0 ? netProfit / gdv : 0;
  const equity = totalProjectCost - debt;

  // Unlevered monthly cashflow: land at t0, build spread over the period,
  // revenue (net of marketing/selling) at completion.
  const N = Math.max(1, Math.round(a.developmentMonths));
  const cf = new Array(N + 1).fill(0);
  cf[0] = -inputs.landCost;
  const monthlyBuild = hardSoft / N;
  for (let t = 1; t <= N; t++) cf[t] -= monthlyBuild;
  cf[N] += gdv - marketing - sellingCosts;
  const projectIrr = irr(cf);

  const rm = Math.pow(1 + a.discountRatePct / 100, 1 / 12) - 1;
  const npv = cf.reduce((acc, c, t) => acc + c / Math.pow(1 + rm, t), 0);

  let cumulative = 0;
  let paybackMonths = N;
  for (let t = 0; t <= N; t++) {
    cumulative += cf[t];
    if (cumulative >= 0) {
      paybackMonths = t;
      break;
    }
  }

  const breakEvenSalePricePerSqm =
    nsaSqm > 0
      ? (inputs.landCost + hardSoft + financeCost) /
        (1 - a.marketingPct / 100 - a.sellingCostsPct / 100) /
        nsaSqm
      : 0;

  const viabilityScore = Math.max(0, Math.min(100, Math.round((profitOnCost / 0.2) * 100)));

  return {
    a,
    nsaSqm,
    gdv,
    construction,
    professionalFees,
    contingency,
    marketing,
    sellingCosts,
    financeCost,
    totalProjectCost,
    grossProfit,
    netProfit,
    profitOnCost,
    profitOnGdv,
    equity,
    debt,
    projectIrr,
    npv,
    paybackMonths,
    breakEvenSalePricePerSqm,
    viabilityScore,
  };
}

export function computeFeasibility(inputs: FeasibilityInputs): FeasibilityOutputs {
  const r = core(inputs);

  const scenario = (name: string, over: Partial<FeasibilityInputs>): ScenarioResult => {
    const s = core({ ...inputs, ...over });
    return { name, netProfit: round(s.netProfit), profitOnCost: round4(s.profitOnCost), projectIrr: round4(s.projectIrr) };
  };

  return {
    currency: inputs.currency ?? 'USD',
    nsaSqm: round(r.nsaSqm),
    gdv: round(r.gdv),
    construction: round(r.construction),
    professionalFees: round(r.professionalFees),
    contingency: round(r.contingency),
    marketing: round(r.marketing),
    sellingCosts: round(r.sellingCosts),
    landCost: round(inputs.landCost),
    financeCost: round(r.financeCost),
    totalProjectCost: round(r.totalProjectCost),
    grossProfit: round(r.grossProfit),
    netProfit: round(r.netProfit),
    profitOnCost: round4(r.profitOnCost),
    profitOnGdv: round4(r.profitOnGdv),
    equity: round(r.equity),
    debt: round(r.debt),
    ltc: round4(r.totalProjectCost > 0 ? r.debt / r.totalProjectCost : 0),
    ltv: round4(r.gdv > 0 ? r.debt / r.gdv : 0),
    roe: round4(r.equity > 0 ? r.netProfit / r.equity : 0),
    projectIrr: round4(r.projectIrr),
    npv: round(r.npv),
    paybackMonths: r.paybackMonths,
    breakEvenSalePricePerSqm: round(r.breakEvenSalePricePerSqm),
    viabilityScore: r.viabilityScore,
    scenarios: [
      scenario('Base', {}),
      scenario('Upside', {
        salePricePerSqm: inputs.salePricePerSqm * 1.1,
        constructionCostPerSqm: inputs.constructionCostPerSqm * 0.95,
      }),
      scenario('Downside', {
        salePricePerSqm: inputs.salePricePerSqm * 0.9,
        constructionCostPerSqm: inputs.constructionCostPerSqm * 1.1,
        developmentMonths: (inputs.developmentMonths ?? DEFAULTS.developmentMonths) + 6,
      }),
    ],
  };
}

function round(n: number): number {
  return Math.round(n);
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
