import { computeFeasibility, irr, FeasibilityInputs } from './feasibility.engine';

/**
 * Worked example (defaults: eff 80%, fees 8%, contingency 5%, marketing 3%,
 * selling 2%, 24 months, LTC 60%, finance 8%, drawdown 0.6):
 *   GFA 10,000 -> NSA 8,000; price 5,000 -> GDV 40,000,000
 *   construction 15,000,000; fees 1,200,000; contingency 810,000
 *   land 8,000,000; net profit ~ 11,549,424; profit-on-cost ~ 40.6%
 */
const base: FeasibilityInputs = {
  gfaSqm: 10000,
  salePricePerSqm: 5000,
  constructionCostPerSqm: 1500,
  landCost: 8_000_000,
};

describe('computeFeasibility', () => {
  it('computes the core outputs for the worked example', () => {
    const o = computeFeasibility(base);
    expect(o.nsaSqm).toBe(8000);
    expect(o.gdv).toBe(40_000_000);
    expect(o.construction).toBe(15_000_000);
    expect(o.professionalFees).toBe(1_200_000);
    expect(o.contingency).toBe(810_000);
    expect(o.netProfit).toBeGreaterThan(11_400_000);
    expect(o.netProfit).toBeLessThan(11_700_000);
    expect(o.profitOnCost).toBeGreaterThan(0.39);
    expect(o.profitOnCost).toBeLessThan(0.42);
  });

  it('produces a positive unlevered IRR and NPV for a profitable scheme', () => {
    const o = computeFeasibility(base);
    expect(o.projectIrr).toBeGreaterThan(0);
    expect(o.npv).toBeGreaterThan(0);
  });

  it('break-even price is well below the assumed sale price', () => {
    const o = computeFeasibility(base);
    expect(o.breakEvenSalePricePerSqm).toBeGreaterThan(3000);
    expect(o.breakEvenSalePricePerSqm).toBeLessThan(5000);
  });

  it('downside scenario is worse than base, upside is better', () => {
    const o = computeFeasibility(base);
    const bs = o.scenarios.find((s) => s.name === 'Base')!;
    const up = o.scenarios.find((s) => s.name === 'Upside')!;
    const down = o.scenarios.find((s) => s.name === 'Downside')!;
    expect(up.profitOnCost).toBeGreaterThan(bs.profitOnCost);
    expect(down.profitOnCost).toBeLessThan(bs.profitOnCost);
  });

  it('a loss-making scheme scores low and has negative profit', () => {
    const o = computeFeasibility({ ...base, salePricePerSqm: 2000 });
    expect(o.netProfit).toBeLessThan(0);
    expect(o.viabilityScore).toBe(0);
  });

  it('irr() returns 0 when there is no sign change', () => {
    expect(irr([-100, -50, -20])).toBe(0);
  });
});
