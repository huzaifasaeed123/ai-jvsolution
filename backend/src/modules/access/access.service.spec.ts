import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AccessService } from './access.service';
import { AccessRepository } from './access.repository';
import { AuditService } from './audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { AccessStatus } from '@prisma/client';

const requester: AuthUser = { id: 'dev-1', email: 'd@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };
const owner: AuthUser = { id: 'own-1', email: 'o@x.com', role: 'OWNER', accessLevel: 'REGISTERED' };

function reqRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    opportunityId: 'op-1',
    opportunity: { id: 'op-1', reference: 'JV-AE-1', title: 'Plot' },
    requesterId: 'dev-1',
    requester: { id: 'dev-1', fullName: 'Dev', email: 'd@x.com' },
    ownerId: 'own-1',
    status: AccessStatus.PENDING,
    message: null,
    ndaSignedAt: null,
    decidedAt: null,
    decidedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AccessService', () => {
  let repo: jest.Mocked<
    Pick<
      AccessRepository,
      'getOpportunityMeta' | 'findByOpportunityAndRequester' | 'create' | 'findById' | 'update' | 'hasGrant'
    >
  >;
  let audit: { record: jest.Mock };
  let service: AccessService;

  beforeEach(() => {
    repo = {
      getOpportunityMeta: jest.fn(),
      findByOpportunityAndRequester: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      hasGrant: jest.fn(),
    };
    audit = { record: jest.fn().mockResolvedValue(undefined) };
    service = new AccessService(repo as unknown as AccessRepository, audit as unknown as AuditService);
  });

  it('rejects requesting access to your own opportunity', async () => {
    repo.getOpportunityMeta.mockResolvedValue({ id: 'op-1', ownerId: 'own-1', status: 'PUBLISHED' });
    await expect(service.request(owner, { opportunityId: 'op-1' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a duplicate active request', async () => {
    repo.getOpportunityMeta.mockResolvedValue({ id: 'op-1', ownerId: 'own-1', status: 'PUBLISHED' });
    repo.findByOpportunityAndRequester.mockResolvedValue(reqRow({ status: AccessStatus.PENDING }) as never);
    await expect(service.request(requester, { opportunityId: 'op-1' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('creates a pending request and audits it', async () => {
    repo.getOpportunityMeta.mockResolvedValue({ id: 'op-1', ownerId: 'own-1', status: 'PUBLISHED' });
    repo.findByOpportunityAndRequester.mockResolvedValue(null);
    repo.create.mockResolvedValue(reqRow() as never);
    const res = await service.request(requester, { opportunityId: 'op-1' });
    expect(res.status).toBe('PENDING');
    expect(res.accessGranted).toBe(false);
    expect(audit.record).toHaveBeenCalled();
  });

  it('blocks a non-owner from approving', async () => {
    repo.findById.mockResolvedValue(reqRow() as never);
    await expect(service.decide(requester, 'r1', true)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses NDA signing before owner approval', async () => {
    repo.findById.mockResolvedValue(reqRow({ status: AccessStatus.PENDING }) as never);
    await expect(service.signNda(requester, 'r1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('grants access only after approve + NDA (accessGranted flag)', async () => {
    repo.findById.mockResolvedValue(reqRow({ status: AccessStatus.APPROVED }) as never);
    repo.update.mockResolvedValue(
      reqRow({ status: AccessStatus.APPROVED, ndaSignedAt: new Date() }) as never,
    );
    const res = await service.signNda(requester, 'r1');
    expect(res.accessGranted).toBe(true);
  });
});
