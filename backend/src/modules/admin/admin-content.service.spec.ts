import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OpportunityStatus, VerificationTier } from '@prisma/client';
import { AdminContentService } from './admin-content.service';
import { AdminRepository } from './admin.repository';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const admin: AuthUser = {
  id: 'admin-1',
  email: 'a@x.com',
  role: 'ADMIN',
  accessLevel: 'TRANSACTION',
};

function opp(over: Record<string, unknown> = {}) {
  return {
    id: 'op-1',
    reference: 'JV-AE-000001',
    title: 'Plot',
    sector: 'mixed-use',
    countryCode: 'AE',
    city: 'Dubai',
    status: OpportunityStatus.PUBLISHED,
    verification: VerificationTier.T1,
    ownerCategory: 'PRIVATE',
    currency: 'USD',
    projectValueCents: 12345600n,
    coverImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    owner: { id: 'own-1', fullName: 'Owner', email: 'o@x.com', role: 'OWNER' },
    ...over,
  };
}

describe('AdminContentService', () => {
  let repo: {
    findOpportunity: jest.Mock;
    updateOpportunity: jest.Mock;
    verificationQueue: jest.Mock;
  };
  let audit: { record: jest.Mock };
  let service: AdminContentService;

  beforeEach(() => {
    repo = {
      findOpportunity: jest.fn().mockResolvedValue(opp()),
      updateOpportunity: jest
        .fn()
        .mockImplementation((id: string, data: Record<string, unknown>) =>
          Promise.resolve(opp({ id, ...data })),
        ),
      verificationQueue: jest.fn().mockResolvedValue([]),
    };
    audit = { record: jest.fn() };
    service = new AdminContentService(
      repo as unknown as AdminRepository,
      audit as unknown as AuditService,
    );
  });

  // --- takedown is reversible, not destructive ----------------------------

  it('unpublishing returns the listing to draft rather than destroying it', async () => {
    const r = await service.unpublish(admin, 'op-1', 'Misleading figures');
    expect(repo.updateOpportunity).toHaveBeenCalledWith('op-1', {
      status: OpportunityStatus.DRAFT,
    });
    expect(r.status).toBe(OpportunityStatus.DRAFT);
  });

  it('refuses to unpublish a listing that is not on the market', async () => {
    repo.findOpportunity.mockResolvedValue(opp({ status: OpportunityStatus.DRAFT }));
    await expect(service.unpublish(admin, 'op-1', 'reason here')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('refuses to archive an already-archived listing', async () => {
    repo.findOpportunity.mockResolvedValue(opp({ status: OpportunityStatus.ARCHIVED }));
    await expect(service.archive(admin, 'op-1', 'reason here')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('restore clears a soft delete and returns to draft, not to the market', async () => {
    repo.findOpportunity.mockResolvedValue(
      opp({ status: OpportunityStatus.ARCHIVED, deletedAt: new Date() }),
    );
    await service.restore(admin, 'op-1');
    expect(repo.updateOpportunity).toHaveBeenCalledWith('op-1', {
      status: OpportunityStatus.DRAFT,
      deletedAt: null,
    });
  });

  it('refuses to restore a listing that was never taken down', async () => {
    await expect(service.restore(admin, 'op-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('404s on an unknown listing', async () => {
    repo.findOpportunity.mockResolvedValue(null);
    await expect(service.getOpportunity('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  // --- accountability ------------------------------------------------------

  it('records the reason and the affected owner on every takedown', async () => {
    await service.unpublish(admin, 'op-1', 'Duplicate listing');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'OPPORTUNITY_UNPUBLISHED',
        opportunityId: 'op-1',
        targetUserId: 'own-1',
        metadata: { reason: 'Duplicate listing', previousStatus: OpportunityStatus.PUBLISHED },
      }),
    );
  });

  // --- money ---------------------------------------------------------------

  it('converts stored minor units to major for display', async () => {
    const r = await service.getOpportunity('op-1');
    expect(r.projectValue).toBe(123456);
    expect(r).not.toHaveProperty('projectValueCents');
  });

  // --- verification queue --------------------------------------------------

  it('explains why each listing is in the review queue', async () => {
    repo.verificationQueue.mockResolvedValue([
      opp({ id: 'a', verificationRecord: null }),
      opp({
        id: 'b',
        verification: VerificationTier.T1,
        verificationRecord: {
          unresolvedItems: [],
          verifiedFields: ['ownership'],
          reviewedAt: new Date(),
          reviewerName: 'Rev',
        },
      }),
      opp({
        id: 'c',
        verification: VerificationTier.T3,
        verificationRecord: {
          unresolvedItems: ['title-deed'],
          verifiedFields: ['ownership'],
          reviewedAt: new Date(),
          reviewerName: 'Rev',
        },
      }),
    ]);
    const q = await service.verificationQueue();
    expect(q.items.map((i) => i.reason)).toEqual([
      'Never reviewed',
      'Self-declared only',
      'Unresolved items outstanding',
    ]);
    expect(q.items[0].neverReviewed).toBe(true);
    expect(q.items[2].unresolvedCount).toBe(1);
  });
});
