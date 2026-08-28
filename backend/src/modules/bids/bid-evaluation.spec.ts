import { evaluateBids, EvaluableBid, EvaluationCriterion } from './bid-evaluation';

function bid(id: string, over: Partial<EvaluableBid> = {}): EvaluableBid {
  return {
    bidId: id,
    reference: `BID-${id}`,
    bidderName: id,
    status: 'SUBMITTED',
    bidPrice: null,
    annualPayment: null,
    revenueSharePct: null,
    deliveryMonths: null,
    experienceYears: null,
    financialCapacity: null,
    localContentPct: null,
    ...over,
  };
}

const PRICE_ONLY: EvaluationCriterion[] = [{ key: 'financial', label: 'Financial offer', weight: 100 }];

describe('bid evaluation', () => {
  it('scores lower price higher (direction-aware)', () => {
    const cheap = bid('cheap', { bidPrice: 100 });
    const pricey = bid('pricey', { bidPrice: 200 });
    const r = evaluateBids([pricey, cheap], PRICE_ONLY);
    expect(r.evaluated[0].bidId).toBe('cheap');
    expect(r.recommendedBidId).toBe('cheap');
    expect(r.evaluated[0].rank).toBe(1);
  });

  it('scores faster delivery and more experience higher', () => {
    const criteria: EvaluationCriterion[] = [
      { key: 'delivery', label: 'Delivery', weight: 50 },
      { key: 'experience', label: 'Experience', weight: 50 },
    ];
    const strong = bid('strong', { deliveryMonths: 18, experienceYears: 20 });
    const weak = bid('weak', { deliveryMonths: 40, experienceYears: 3 });
    const r = evaluateBids([weak, strong], criteria);
    expect(r.evaluated[0].bidId).toBe('strong');
  });

  it('excludes withdrawn and disqualified bids from the field', () => {
    const ok = bid('ok', { bidPrice: 500 });
    const out1 = bid('withdrawn', { bidPrice: 1, status: 'WITHDRAWN' });
    const out2 = bid('dq', { bidPrice: 1, status: 'DISQUALIFIED' });
    const r = evaluateBids([ok, out1, out2], PRICE_ONLY);
    expect(r.evaluated).toHaveLength(1);
    expect(r.evaluated[0].bidId).toBe('ok');
  });

  it('uses an authority manual score for subjective criteria', () => {
    const criteria: EvaluationCriterion[] = [{ key: 'technical', label: 'Technical', weight: 100 }];
    const a = bid('a', { manualScores: { technical: 90 } });
    const b = bid('b', { manualScores: { technical: 40 } });
    const r = evaluateBids([b, a], criteria);
    expect(r.evaluated[0].bidId).toBe('a');
    expect(r.evaluated[0].score).toBe(90);
    expect(r.evaluated[0].criteria[0].source).toBe('manual');
  });

  it('flags unscored subjective criteria instead of silently crediting them', () => {
    const criteria: EvaluationCriterion[] = [{ key: 'technical', label: 'Technical', weight: 100 }];
    const r = evaluateBids([bid('a')], criteria);
    expect(r.evaluated[0].criteria[0].source).toBe('unscored');
    expect(r.evaluated[0].score).toBe(0);
    expect(r.evaluated[0].notes.join()).toMatch(/not yet scored/i);
  });

  it('treats a missing objective value as the worst in the field and notes it', () => {
    const withPrice = bid('has', { bidPrice: 100 });
    const noPrice = bid('none');
    const r = evaluateBids([withPrice, noPrice], PRICE_ONLY);
    expect(r.evaluated[0].bidId).toBe('has');
    const missing = r.evaluated.find((e) => e.bidId === 'none')!;
    expect(missing.notes.join()).toMatch(/no value supplied/i);
  });

  it('weights drive the outcome', () => {
    const criteria = (priceW: number, expW: number): EvaluationCriterion[] => [
      { key: 'financial', label: 'Price', weight: priceW },
      { key: 'experience', label: 'Experience', weight: expW },
    ];
    const cheapInexperienced = bid('cheap', { bidPrice: 100, experienceYears: 1 });
    const pricyExpert = bid('expert', { bidPrice: 300, experienceYears: 25 });
    expect(evaluateBids([cheapInexperienced, pricyExpert], criteria(100, 0)).evaluated[0].bidId).toBe('cheap');
    expect(evaluateBids([cheapInexperienced, pricyExpert], criteria(0, 100)).evaluated[0].bidId).toBe('expert');
  });

  it('returns null recommendation when there is no evaluable field', () => {
    const r = evaluateBids([bid('x', { status: 'WITHDRAWN' })], PRICE_ONLY);
    expect(r.evaluated).toHaveLength(0);
    expect(r.recommendedBidId).toBeNull();
  });
});
