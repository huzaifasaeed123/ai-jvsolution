import { recommendStructures } from './structure-recommender';

describe('structure recommender', () => {
  it('recommends an owner-retains private structure for a private owner keeping title', () => {
    const r = recommendStructures({
      ownerType: 'PRIVATE',
      landOwnershipRetained: true,
      financingRequired: false,
      revenueCertainty: 'high',
    });
    expect(r.recommended).not.toBeNull();
    // Top result should keep the owner's title and be private.
    const topCodes = r.ranked.slice(0, 4).map((s) => s.code);
    expect(topCodes.some((c) => ['gfa-share-jv', 'jda', 'musataha', 'long-term-lease'].includes(c))).toBe(true);
    expect(r.recommended!.score).toBeGreaterThan(0);
    expect(r.recommended!.reasons.length).toBeGreaterThan(0);
  });

  it('recommends a PPP/concession structure for a government owner needing private finance + user pay + transfer', () => {
    const r = recommendStructures({
      ownerType: 'GOVERNMENT',
      financingRequired: true,
      userPay: true,
      transferRequired: true,
      concessionTermYears: 30,
      riskAppetite: 'high',
    });
    const topCodes = r.ranked.slice(0, 3).map((s) => s.code);
    expect(topCodes.some((c) => ['bot', 'boot', 'concession', 'bto'].includes(c))).toBe(true);
  });

  it('favours availability-payment / DBFO when government pays and risk appetite is low', () => {
    const r = recommendStructures({
      ownerType: 'GOVERNMENT',
      financingRequired: true,
      governmentPay: true,
      transferRequired: true,
      riskAppetite: 'low',
    });
    const topCodes = r.ranked.slice(0, 3).map((s) => s.code);
    expect(topCodes.some((c) => ['dbfo', 'availability-payment', 'dbfom'].includes(c))).toBe(true);
  });

  it('ranks all structures and provides alternatives', () => {
    const r = recommendStructures({ ownerType: 'PRIVATE' });
    expect(r.ranked.length).toBeGreaterThan(10);
    expect(r.alternatives.length).toBe(3);
    // sorted descending
    for (let i = 1; i < r.ranked.length; i++) {
      expect(r.ranked[i - 1].score).toBeGreaterThanOrEqual(r.ranked[i].score);
    }
  });
});
