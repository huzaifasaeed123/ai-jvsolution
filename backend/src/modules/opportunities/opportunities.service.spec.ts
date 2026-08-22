import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesRepository, OpportunityWithOwner } from './opportunities.repository';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { OwnerCategory, OpportunityStatus, VerificationTier } from '@prisma/client';

function fakeOpportunity(overrides: Partial<OpportunityWithOwner> = {}): OpportunityWithOwner {
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
    countryCode: 'AE',
    region: null,
    city: null,
    addressLine: null,
    latitude: null,
    longitude: null,
    landAreaSqm: null,
    gfaSqm: null,
    buaSqm: null,
    nsaSqm: null,
    plotRatio: null,
    landUse: null,
    heightLimit: null,
    currency: 'USD',
    projectValueCents: null,
    investmentRequiredCents: null,
    targetIrr: null,
    developmentPeriodMonths: null,
    concessionPeriodYears: null,
    structures: [],
    riskLevel: null,
    permitStatus: 'NONE',
    dataRoomReadiness: 'EMPTY',
    requiredDeveloperExperience: null,
    requiredContractorClass: null,
    requiredOperatorType: null,
    financingRequired: false,
    ownerId: 'owner-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    owner: { id: 'owner-1', fullName: 'Jane', email: 'jane@example.com', companyId: null },
    ...overrides,
  };
}

const owner: AuthUser = { id: 'owner-1', email: 'jane@example.com', role: 'OWNER', accessLevel: 'REGISTERED' };
const stranger: AuthUser = { id: 'other-9', email: 'bob@example.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };

describe('OpportunitiesService (authorization)', () => {
  let repo: jest.Mocked<Pick<OpportunitiesRepository, 'findById' | 'update' | 'softDelete'>>;
  let service: OpportunitiesService;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };
    const access = { hasAccess: jest.fn().mockResolvedValue(false) };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    service = new OpportunitiesService(
      repo as unknown as OpportunitiesRepository,
      access as never,
      audit as never,
    );
  });

  it('blocks a non-owner from updating an opportunity', async () => {
    repo.findById.mockResolvedValue(fakeOpportunity());
    await expect(service.update(stranger, 'o1', { title: 'Hijack' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('allows the owner to update', async () => {
    repo.findById.mockResolvedValue(fakeOpportunity());
    repo.update.mockResolvedValue(fakeOpportunity({ title: 'New' }));
    const result = await service.update(owner, 'o1', { title: 'New' });
    expect(result.title).toBe('New');
  });

  it('hides a draft from an anonymous viewer (404)', async () => {
    repo.findById.mockResolvedValue(fakeOpportunity({ status: OpportunityStatus.DRAFT }));
    await expect(service.getOne('o1', undefined)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns confidential (full) view to the owner', async () => {
    repo.findById.mockResolvedValue(
      fakeOpportunity({ status: OpportunityStatus.DRAFT, addressLine: 'Secret' }),
    );
    const result = await service.getOne('o1', owner);
    expect(result.confidentialLocked).toBe(false);
  });
});
