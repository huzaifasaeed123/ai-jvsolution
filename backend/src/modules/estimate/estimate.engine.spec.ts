import { computeEstimate } from './estimate.engine';

describe('estimate engine', () => {
  it('computes construction, adders and total for a standard 10,000 m² scheme', () => {
    const o = computeEstimate({ areaSqm: 10000, specLevel: 'standard' });
    // rate 1400 -> construction 14,000,000
    expect(o.rateUsed).toBe(1400);
    expect(o.construction).toBe(14_000_000);
    // elemental split sums back to construction
    const sum = o.elements.reduce((a, e) => a + e.amount, 0);
    expect(sum).toBe(14_000_000);
    expect(o.totalDevelopmentCost).toBeGreaterThan(o.construction);
    expect(o.costPerSqm).toBe(Math.round(o.totalDevelopmentCost / 10000));
  });

  it('a higher spec level costs more', () => {
    const std = computeEstimate({ areaSqm: 10000, specLevel: 'standard' });
    const lux = computeEstimate({ areaSqm: 10000, specLevel: 'luxury' });
    expect(lux.totalDevelopmentCost).toBeGreaterThan(std.totalDevelopmentCost);
  });

  it('baseRatePerSqm overrides the spec level', () => {
    const o = computeEstimate({ areaSqm: 1000, specLevel: 'economy', baseRatePerSqm: 3000 });
    expect(o.rateUsed).toBe(3000);
    expect(o.construction).toBe(3_000_000);
  });

  it('produces a per-unit metric when units are given', () => {
    const o = computeEstimate({ areaSqm: 10000, units: 100, unitBasis: 'unit' });
    expect(o.costPerUnit).toBe(Math.round(o.totalDevelopmentCost / 100));
    expect(o.unitBasis).toBe('unit');
  });

  it('has no per-unit metric without units', () => {
    const o = computeEstimate({ areaSqm: 10000 });
    expect(o.costPerUnit).toBeNull();
    expect(o.unitBasis).toBeNull();
  });
});
