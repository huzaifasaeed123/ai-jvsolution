import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { TendersRepository } from './tenders.repository';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const authority: AuthUser = { id: 'gov-1', email: 'g@x.com', role: 'GOVERNMENT', accessLevel: 'REGISTERED' };
const bidder: AuthUser = { id: 'dev-1', email: 'd@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };

const FUTURE = new Date(Date.now() + 14 * 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

function tender(over: Record<string, unknown> = {}) {
  return {
    id: 't1',
    reference: 'TND-AE-ABC123',
    title: 'Metro Line 3',
    procurementType: 'RFP',
    stage: 'DRAFT',
    opportunityId: 'op-1',
    authorityId: 'gov-1',
    authority: { id: 'gov-1', fullName: 'Authority', email: 'g@x.com' },
    opportunity: { id: 'op-1', reference: 'JV-AE-1', title: 'Metro', countryCode: 'AE', sector: 'roads-rail-metro' },
    riskAllocation: [],
    evaluationCriteria: [],
    currency: 'USD',
    estimatedValueCents: null,
    bidSecurityCents: null,
    concessionYears: null,
    clarificationDeadline: null,
    submissionDeadline: FUTURE,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...over,
  };
}

describe('TendersService', () => {
  let repo: jest.Mocked<Pick<TendersRepository, 'getOpportunityMeta' | 'create' | 'findById' | 'update' | 'softDelete'>>;
  let audit: { record: jest.Mock };
  let service: TendersService;

  beforeEach(() => {
    repo = {
      getOpportunityMeta: jest.fn().mockResolvedValue({
        id: 'op-1', ownerId: 'gov-1', status: 'PUBLISHED', ownerCategory: 'GOVERNMENT', countryCode: 'AE',
      }),
      create: jest.fn().mockResolvedValue(tender()),
      findById: jest.fn().mockResolvedValue(tender()),
      update: jest.fn().mockImplementation((_id, data) => Promise.resolve(tender(data))),
      softDelete: jest.fn().mockResolvedValue({}),
    };
    audit = { record: jest.fn().mockResolvedValue(undefined) };
    service = new TendersService(repo as unknown as TendersRepository, audit as unknown as AuditService);
  });

  it('creates a tender for a government opportunity and defaults evaluation criteria', async () => {
    const r = await service.create(authority, 'op-1', { title: 'Metro Line 3' });
    expect(repo.create).toHaveBeenCalled();
    const arg = repo.create.mock.calls[0][0] as Record<string, unknown>;
    expect((arg.evaluationCriteria as unknown[]).length).toBeGreaterThan(0);
    expect(r.reference).toMatch(/^TND-AE-/);
    expect(audit.record).toHaveBeenCalled();
  });

  it('refuses a tender on a PRIVATE opportunity (tenders are a public instrument)', async () => {
    repo.getOpportunityMeta.mockResolvedValue({
      id: 'op-1', ownerId: 'gov-1', status: 'PUBLISHED', ownerCategory: 'PRIVATE', countryCode: 'AE',
    } as never);
    await expect(service.create(authority, 'op-1', { title: 'X' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a tender from a non-owner', async () => {
    await expect(service.create(bidder, 'op-1', { title: 'X' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('hides a DRAFT tender from non-authority viewers', async () => {
    await expect(service.getOne('t1', bidder)).rejects.toBeInstanceOf(NotFoundException);
    const asAuthority = await service.getOne('t1', authority);
    expect(asAuthority.stage).toBe('DRAFT');
  });

  it('enforces legal stage transitions', async () => {
    // DRAFT -> UNDER_EVALUATION is not allowed (must publish and close first)
    await expect(service.setStage(authority, 't1', 'UNDER_EVALUATION' as never)).rejects.toBeInstanceOf(BadRequestException);
    // DRAFT -> PUBLISHED is allowed
    const published = await service.setStage(authority, 't1', 'PUBLISHED' as never);
    expect(published.stage).toBe('PUBLISHED');
  });

  it('refuses to publish without a future submission deadline', async () => {
    repo.findById.mockResolvedValue(tender({ submissionDeadline: null }) as never);
    await expect(service.setStage(authority, 't1', 'PUBLISHED' as never)).rejects.toBeInstanceOf(BadRequestException);
    repo.findById.mockResolvedValue(tender({ submissionDeadline: PAST }) as never);
    await expect(service.setStage(authority, 't1', 'PUBLISHED' as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks a bidder from changing the stage', async () => {
    await expect(service.setStage(bidder, 't1', 'PUBLISHED' as never)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks amendments once bidding has closed', async () => {
    repo.findById.mockResolvedValue(tender({ stage: 'UNDER_EVALUATION' }) as never);
    await expect(service.update(authority, 't1', { title: 'Changed' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('only deletes drafts', async () => {
    repo.findById.mockResolvedValue(tender({ stage: 'PUBLISHED' }) as never);
    await expect(service.remove(authority, 't1')).rejects.toBeInstanceOf(BadRequestException);
    repo.findById.mockResolvedValue(tender() as never);
    await expect(service.remove(authority, 't1')).resolves.toEqual({ id: 't1', deleted: true });
  });

  it('serializer exposes deadline helpers', async () => {
    const r = await service.getOne('t1', authority);
    expect(r.deadlinePassed).toBe(false);
    expect(r.daysRemaining).toBeGreaterThan(0);
  });
});
