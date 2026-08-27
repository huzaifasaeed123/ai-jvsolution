import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersRepository } from './offers.repository';
import { AccessService } from '../access/access.service';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const owner: AuthUser = { id: 'own-1', email: 'o@x.com', role: 'OWNER', accessLevel: 'REGISTERED' };
const dev: AuthUser = { id: 'dev-1', email: 'd@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };

function offerRow(over: Record<string, unknown> = {}) {
  return {
    id: 'of-1',
    opportunityId: 'op-1',
    submittedById: 'dev-1',
    ownerId: 'own-1',
    type: 'OFFER',
    status: 'SUBMITTED',
    currency: 'USD',
    investmentAmountCents: null,
    financialCapacityCents: null,
    ownerSharePct: 30,
    submittedBy: { id: 'dev-1', fullName: 'Dev', email: 'd@x.com', companyId: null },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...over,
  };
}

describe('OffersService', () => {
  let repo: jest.Mocked<Pick<OffersRepository, 'getOpportunityMeta' | 'findExisting' | 'create' | 'findById' | 'update'>>;
  let access: { hasAccess: jest.Mock };
  let audit: { record: jest.Mock };
  let service: OffersService;

  beforeEach(() => {
    repo = {
      getOpportunityMeta: jest.fn().mockResolvedValue({ id: 'op-1', ownerId: 'own-1', status: 'PUBLISHED' }),
      findExisting: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(offerRow()),
      findById: jest.fn().mockResolvedValue(offerRow()),
      update: jest.fn().mockImplementation((_id, data) => Promise.resolve(offerRow(data))),
    };
    access = { hasAccess: jest.fn().mockResolvedValue(true) };
    audit = { record: jest.fn().mockResolvedValue(undefined) };
    service = new OffersService(repo as unknown as OffersRepository, access as unknown as AccessService, audit as unknown as AuditService);
  });

  it('lets an access-granted developer submit an offer', async () => {
    const r = await service.submit(dev, 'op-1', { ownerSharePct: 30 });
    expect(r.ownerSharePct).toBe(30);
    expect(repo.create).toHaveBeenCalled();
  });

  it('blocks the owner from offering on their own opportunity', async () => {
    await expect(service.submit(owner, 'op-1', {})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks a developer without an access grant', async () => {
    access.hasAccess.mockResolvedValue(false);
    await expect(service.submit(dev, 'op-1', {})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a second offer from the same user', async () => {
    repo.findExisting.mockResolvedValue(offerRow());
    await expect(service.submit(dev, 'op-1', {})).rejects.toBeInstanceOf(ConflictException);
  });

  it('only the owner can change an offer status, and only to allowed values', async () => {
    await expect(service.setStatus(dev, 'of-1', 'ACCEPTED' as never)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.setStatus(owner, 'of-1', 'SUBMITTED' as never)).rejects.toBeInstanceOf(BadRequestException);
    const r = await service.setStatus(owner, 'of-1', 'SHORTLISTED' as never);
    expect(r.status).toBe('SHORTLISTED');
  });

  it('blocks editing an offer once no longer editable', async () => {
    repo.findById.mockResolvedValue(offerRow({ status: 'ACCEPTED' }));
    await expect(service.update(dev, 'of-1', { ownerSharePct: 40 })).rejects.toBeInstanceOf(BadRequestException);
  });
});
