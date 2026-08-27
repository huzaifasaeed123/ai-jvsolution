import { compareOffers, CompareOfferInput } from './offer-comparison';

function offer(id: string, o: Partial<CompareOfferInput>): CompareOfferInput {
  return {
    offerId: id,
    submittedByName: id,
    ownerSharePct: null,
    investmentAmount: null,
    experienceYears: null,
    financialCapacity: null,
    developmentMonths: null,
    hasGuarantees: false,
    ...o,
  };
}

describe('offer comparison', () => {
  it('ranks the best all-round offer first', () => {
    const a = offer('A', { ownerSharePct: 40, experienceYears: 15, developmentMonths: 20, hasGuarantees: true });
    const b = offer('B', { ownerSharePct: 25, experienceYears: 5, developmentMonths: 30 });
    const r = compareOffers([a, b]);
    expect(r.ranked[0].offerId).toBe('A');
    expect(r.recommendedOfferId).toBe('A');
    expect(r.ranked[0].score).toBeGreaterThan(r.ranked[1].score);
  });

  it('respects direction: lower delivery months is better', () => {
    const fast = offer('fast', { developmentMonths: 12, ownerSharePct: 30 });
    const slow = offer('slow', { developmentMonths: 36, ownerSharePct: 30 });
    const r = compareOffers([fast, slow], { delivery: 1, ownerReturn: 0 });
    expect(r.ranked[0].offerId).toBe('fast');
  });

  it('weights change the ranking', () => {
    const highReturn = offer('return', { ownerSharePct: 45, experienceYears: 2 });
    const experienced = offer('exp', { ownerSharePct: 20, experienceYears: 25 });
    const byReturn = compareOffers([highReturn, experienced], { ownerReturn: 1, experience: 0 });
    const byExp = compareOffers([highReturn, experienced], { ownerReturn: 0, experience: 1 });
    expect(byReturn.ranked[0].offerId).toBe('return');
    expect(byExp.ranked[0].offerId).toBe('exp');
  });

  it('weights are normalized to sum to 1', () => {
    const r = compareOffers([offer('A', { ownerSharePct: 30 })], { ownerReturn: 10, experience: 10 });
    const sum = Object.values(r.weights).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('surfaces reasons for a leading offer', () => {
    const a = offer('A', { ownerSharePct: 50, experienceYears: 20 });
    const b = offer('B', { ownerSharePct: 10, experienceYears: 1 });
    const r = compareOffers([a, b]);
    expect(r.ranked[0].reasons.length).toBeGreaterThan(0);
  });
});
