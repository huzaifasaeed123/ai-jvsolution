export interface FeasibilityInputs {
  currency?: string;
  gfaSqm: number;
  efficiencyPct?: number;
  salePricePerSqm: number;
  constructionCostPerSqm: number;
  landCost: number;
  professionalFeesPct?: number;
  contingencyPct?: number;
  marketingPct?: number;
  sellingCostsPct?: number;
  developmentMonths?: number;
  debtRatioPct?: number;
  financeRatePct?: number;
  discountRatePct?: number;
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
  profitOnCost: number;
  profitOnGdv: number;
  equity: number;
  debt: number;
  ltc: number;
  ltv: number;
  roe: number;
  projectIrr: number;
  npv: number;
  paybackMonths: number;
  breakEvenSalePricePerSqm: number;
  viabilityScore: number;
  scenarios: ScenarioResult[];
}

export interface Explanation {
  text: string;
  method: 'template' | 'llm';
  confidence: 'deterministic' | 'estimated';
  provider: string;
}

export interface ComputeResult {
  formulaVersion: string;
  assumptions: Record<string, unknown>;
  outputs: FeasibilityOutputs;
  explanation: Explanation;
}
