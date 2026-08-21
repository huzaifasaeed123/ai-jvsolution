import { scoreFit, OpportunityLike, MandateLike } from './fit-score';
import { OwnerCategory, RiskLevel } from '@prisma/client';

const baseOpp: OpportunityLike = {
  sector: 'mixed-use',
  countryCode: 'AE',
  investmentRequiredCents: 40_000_000_00n, // $40M
  structures: ['gfa-share-jv', 'musataha'],
  targetIrr: 20,
  ownerCategory: OwnerCategory.PRIVATE,
  riskLevel: RiskLevel.MODERATE,
};

const baseMandate: MandateLike = {
  sectors: ['mixed-use', 'residential'],
  countryCodes: ['AE', 'SA'],
  structures: ['gfa-share-jv'],
  ownerCategories: [OwnerCategory.PRIVATE],
  minInvestmentCents: 20_000_000_00n, // $20M
  maxInvestmentCents: 60_000_000_00n, // $60M
  targetIrr: 15,
  riskAppetite: RiskLevel.MEDIUM,
};

describe('scoreFit', () => {
  it('scores a strong all-round match highly (A) and is explainable', () => {
    const r = scoreFit(baseOpp, baseMandate);
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.grade).toBe('A');
    expect(r.reasons.length).toBeGreaterThan(0);
    // every factor is present in the breakdown
    expect(r.factors.map((f) => f.key)).toEqual(
      expect.arrayContaining(['sector', 'country', 'investment', 'structures', 'irr', 'ownerCategory', 'risk']),
    );
  });

  it('penalizes a wrong-sector, wrong-country opportunity', () => {
    const r = scoreFit({ ...baseOpp, sector: 'airport', countryCode: 'US' }, baseMandate);
    expect(r.score).toBeLessThan(60);
  });

  it('ignores factors with missing data (normalized over applicable weight)', () => {
    // Mandate with only a sector preference; opportunity matches it.
    const m: MandateLike = {
      sectors: ['mixed-use'],
      countryCodes: [],
      structures: [],
      ownerCategories: [],
      minInvestmentCents: null,
      maxInvestmentCents: null,
      targetIrr: null,
      riskAppetite: null,
    };
    const r = scoreFit(baseOpp, m);
    expect(r.score).toBe(100); // only applicable factor (sector) fully matches
  });

  it('marks investment below the minimum ticket as a weaker fit', () => {
    const r = scoreFit({ ...baseOpp, investmentRequiredCents: 5_000_000_00n }, baseMandate); // $5M < $20M
    const inv = r.factors.find((f) => f.key === 'investment');
    expect(inv?.score).toBeLessThan(1);
  });

  it('flags risk exceeding appetite', () => {
    const r = scoreFit({ ...baseOpp, riskLevel: RiskLevel.HIGH }, { ...baseMandate, riskAppetite: RiskLevel.LOW });
    const risk = r.factors.find((f) => f.key === 'risk');
    expect(risk?.score).toBe(0);
  });
});
