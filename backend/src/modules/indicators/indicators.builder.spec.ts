import { buildIndicators, IndicatorsInput, FeasibilitySnapshot } from './indicators.builder';

const feas: FeasibilitySnapshot = {
  currency: 'USD',
  gdv: 40_000_000,
  equity: 11_380_230,
  debt: 17_070_346,
  netProfit: 11_549_424,
  profitOnCost: 0.4059,
  projectIrr: 0.36,
  npv: 7_145_093,
  paybackMonths: 24,
  ltc: 0.6,
  ltv: 0.42,
  roe: 1.0,
  landCost: 8_000_000,
  construction: 15_000_000,
  professionalFees: 1_200_000,
  contingency: 810_000,
  marketing: 1_200_000,
  sellingCosts: 800_000,
  financeCost: 1_440_576,
  breakEvenSalePricePerSqm: 3_480,
  viabilityScore: 100,
  developmentMonths: 24,
};

function base(over: Partial<IndicatorsInput> = {}): IndicatorsInput {
  return {
    opportunity: {
      reference: 'JV-AE-1', title: 'T', sector: 'mixed-use', countryCode: 'AE',
      ownerCategory: 'PRIVATE', status: 'PUBLISHED', verification: 'T3',
      permitStatus: 'IN_PROGRESS', currency: 'USD',
    },
    feasibility: feas,
    offers: [{ status: 'SHORTLISTED', ownerSharePct: 35, investmentAmount: 40_000_000 }],
    dataRoom: { totalFolders: 48, foldersWithDocs: 12, documentCount: 20 },
    dueDiligence: { total: 25, closed: 5, byRisk: { HIGH: 1 } },
    ...over,
  };
}

describe('buildIndicators', () => {
  it('maps feasibility outputs into KPI cards', () => {
    const r = buildIndicators(base());
    expect(r.hasFeasibility).toBe(true);
    expect(r.kpis?.projectValue).toBe(40_000_000);
    expect(r.kpis?.requiredEquity).toBe(11_380_230);
    expect(r.kpis?.projectIrr).toBe(0.36);
    expect(r.kpis?.developmentMonths).toBe(24);
  });

  it('computes readiness scores', () => {
    const r = buildIndicators(base());
    expect(r.scores.verification).toBe(60); // T3
    expect(r.scores.permits).toBe(66); // IN_PROGRESS
    expect(r.scores.financing).toBe(70); // SHORTLISTED
    expect(r.scores.dataRoom).toBe(25); // 12/48
    expect(r.scores.dueDiligence).toBe(20); // 5/25
    expect(r.scores.overall).toBeGreaterThan(0);
  });

  it('financing score is 100 once an offer is accepted', () => {
    const r = buildIndicators(base({ offers: [{ status: 'ACCEPTED', ownerSharePct: 30, investmentAmount: 1 }] }));
    expect(r.scores.financing).toBe(100);
  });

  it('builds chart series (sources & uses, cost composition, readiness)', () => {
    const r = buildIndicators(base());
    expect(r.charts.sourcesAndUses).toEqual([
      { name: 'Equity', value: 11_380_230 },
      { name: 'Debt', value: 17_070_346 },
    ]);
    expect(r.charts.costComposition.length).toBeGreaterThan(4);
    expect(r.charts.readiness).toHaveLength(5);
  });

  it('handles no feasibility run gracefully', () => {
    const r = buildIndicators(base({ feasibility: null }));
    expect(r.hasFeasibility).toBe(false);
    expect(r.kpis).toBeNull();
    expect(r.charts.sourcesAndUses).toEqual([]);
    // readiness scores still computed
    expect(r.scores.verification).toBe(60);
  });

  it('summarizes offers (count, best owner share)', () => {
    const r = buildIndicators(base({
      offers: [
        { status: 'SUBMITTED', ownerSharePct: 30, investmentAmount: 10 },
        { status: 'SHORTLISTED', ownerSharePct: 38, investmentAmount: 20 },
        { status: 'WITHDRAWN', ownerSharePct: 99, investmentAmount: 5 },
      ],
    }));
    expect(r.offers.count).toBe(2); // withdrawn excluded
    expect(r.offers.bestOwnerSharePct).toBe(38);
  });
});
