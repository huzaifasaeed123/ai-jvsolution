import { OpportunitySerializer } from './opportunity.serializer';
import { OpportunityWithOwner } from './opportunities.repository';
import { OwnerCategory, OpportunityStatus, VerificationTier } from '@prisma/client';

function makeOpportunity(): OpportunityWithOwner {
  return {
    id: 'o1',
    reference: 'JV-AE-ABC123',
    title: 'Plot',
    summary: null,
    sector: 'mixed-use',
    projectType: null,
    ownerCategory: OwnerCategory.PRIVATE,
    status: OpportunityStatus.PUBLISHED,
    verification: VerificationTier.T0,
    coverImageUrl: null,
    galleryUrls: [],
    countryCode: 'AE',
    region: null,
    city: 'Dubai',
    addressLine: 'Plot 42, Secret Street',
    latitude: 25.1,
    longitude: 55.2,
    landAreaSqm: 5000,
    gfaSqm: null,
    buaSqm: null,
    nsaSqm: null,
    plotRatio: null,
    landUse: null,
    heightLimit: null,
    currency: 'USD',
    projectValueCents: 8_500_000_000n,
    investmentRequiredCents: 4_000_000_000n,
    targetIrr: 19.5,
    developmentPeriodMonths: null,
    concessionPeriodYears: null,
    structures: ['gfa-share-jv'],
    riskLevel: null,
    permitStatus: 'NONE',
    dataRoomReadiness: 'EMPTY',
    requiredDeveloperExperience: null,
    requiredContractorClass: null,
    requiredOperatorType: null,
    financingRequired: true,
    ownerId: 'u1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    owner: { id: 'u1', fullName: 'Jane', email: 'jane@example.com', companyId: null },
  };
}

describe('OpportunitySerializer', () => {
  it('public view NEVER exposes confidential fields', () => {
    const pub = OpportunitySerializer.toPublic(makeOpportunity()) as Record<string, unknown>;
    expect(pub.confidentialLocked).toBe(true);
    expect(pub.addressLine).toBeUndefined();
    expect(pub.latitude).toBeUndefined();
    expect(pub.longitude).toBeUndefined();
    expect(pub.owner).toBeUndefined();
    expect(pub.ownerId).toBeUndefined();
  });

  it('public view still exposes indicative commercial data as major units', () => {
    const pub = OpportunitySerializer.toPublic(makeOpportunity());
    expect(pub.projectValue).toBe(85_000_000);
    expect(pub.investmentRequired).toBe(40_000_000);
    expect(pub.currency).toBe('USD');
  });

  it('full view exposes confidential fields + owner identity', () => {
    const full = OpportunitySerializer.toFull(makeOpportunity());
    expect(full.confidentialLocked).toBe(false);
    expect(full.addressLine).toBe('Plot 42, Secret Street');
    expect(full.latitude).toBe(25.1);
    expect(full.owner?.email).toBe('jane@example.com');
  });
});
