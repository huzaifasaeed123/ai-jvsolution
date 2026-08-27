export interface DashboardKpis {
  currency: string;
  projectValue: number;
  requiredEquity: number;
  requiredDebt: number;
  revenue: number;
  netProfit: number;
  projectIrr: number;
  npv: number;
  paybackMonths: number;
  ltc: number;
  ltv: number;
  roe: number;
  breakEven: number;
  developmentMonths: number | null;
}

export interface DashboardScores {
  dataRoom: number;
  dueDiligence: number;
  verification: number;
  financing: number;
  permits: number;
  overall: number;
  bankability: number;
  investmentAttractiveness: number;
}

export interface ChartPoint {
  name: string;
  value: number;
}

export interface InvestorDashboardData {
  opportunity: {
    reference: string;
    title: string;
    sector: string;
    countryCode: string;
    ownerCategory: string;
    status: string;
    verification: string;
    permitStatus: string;
    currency: string;
  };
  hasFeasibility: boolean;
  kpis: DashboardKpis | null;
  scores: DashboardScores;
  offers: { count: number; byStatus: Record<string, number>; bestOwnerSharePct: number | null; currency: string };
  dueDiligence: { total: number; closed: number; byRisk: Record<string, number> };
  charts: {
    sourcesAndUses: ChartPoint[];
    costComposition: ChartPoint[];
    returnComparison: ChartPoint[];
    readiness: ChartPoint[];
  };
}
