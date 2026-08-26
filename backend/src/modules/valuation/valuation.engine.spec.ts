import {
  computeComparable,
  computeDcf,
  computeIncome,
  computeResidual,
} from './valuation.engine';

describe('valuation engine', () => {
  it('residual land value: GDV minus costs minus required profit', () => {
    const r = computeResidual({
      gfaSqm: 10000,
      salePricePerSqm: 5000,
      constructionCostPerSqm: 1500,
    });
    // GDV 40,000,000; residual should be well positive and less than GDV.
    expect(r.breakdown.gdv).toBe(40_000_000);
    expect(r.value).toBeGreaterThan(0);
    expect(r.value).toBeLessThan(40_000_000);
    expect(r.perSqm).toBe(Math.round(r.value / 10000));
  });

  it('residual falls when required profit rises', () => {
    const base = computeResidual({ gfaSqm: 10000, salePricePerSqm: 5000, constructionCostPerSqm: 1500 });
    const greedy = computeResidual({ gfaSqm: 10000, salePricePerSqm: 5000, constructionCostPerSqm: 1500, requiredProfitOnCostPct: 40 });
    expect(greedy.value).toBeLessThan(base.value);
  });

  it('comparable-sales: adjusted average × area', () => {
    const r = computeComparable({ comparables: [1000, 1200, 1400], areaSqm: 500, adjustmentPct: 0 });
    expect(r.breakdown.averagePricePerSqm).toBe(1200);
    expect(r.value).toBe(600_000);
    expect(r.low).toBe(500_000);
    expect(r.high).toBe(700_000);
  });

  it('income-capitalisation: NOI / cap rate', () => {
    const r = computeIncome({ annualRentPerSqm: 300, leasableAreaSqm: 1000, occupancyPct: 100, opexPct: 25, capRatePct: 7.5 });
    // gross 300,000; noi 225,000; value 3,000,000
    expect(r.breakdown.noi).toBe(225_000);
    expect(r.value).toBe(3_000_000);
  });

  it('DCF: discounts annual cashflows + terminal', () => {
    const r = computeDcf({ cashflows: [100, 100, 100], discountRatePct: 10, terminalValue: 1000 });
    // PV of 3×100 at 10% ≈ 248.68; terminal 1000/1.1^3 ≈ 751.31; total ≈ 1000
    expect(r.value).toBeGreaterThan(990);
    expect(r.value).toBeLessThan(1010);
  });
});
