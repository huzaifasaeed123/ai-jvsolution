import { VerificationService } from './verification.service';
import { VerificationRepository } from './verification.repository';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const admin: AuthUser = { id: 'adm', email: 'a@x.com', role: 'ADMIN', accessLevel: 'REGISTERED' };
const owner: AuthUser = { id: 'own-1', email: 'o@x.com', role: 'OWNER', accessLevel: 'REGISTERED' };

describe('VerificationService', () => {
  let repo: jest.Mocked<Pick<VerificationRepository, 'getOpportunity' | 'findByOpportunity' | 'upsert'>>;
  let opportunities: { setVerification: jest.Mock };
  let audit: { record: jest.Mock };
  let service: VerificationService;

  beforeEach(() => {
    repo = {
      getOpportunity: jest.fn().mockResolvedValue({ id: 'op-1', ownerId: 'own-1', status: 'PUBLISHED', verification: 'T3' }),
      findByOpportunity: jest.fn().mockResolvedValue({
        verifiedFields: ['ownership'],
        unresolvedItems: ['x'],
        reviewerName: 'a@x.com',
        notes: 'internal note',
        reviewedAt: new Date(),
      }),
      upsert: jest.fn().mockResolvedValue({ verifiedFields: ['ownership'], unresolvedItems: [] }),
    };
    opportunities = { setVerification: jest.fn().mockResolvedValue(undefined) };
    audit = { record: jest.fn().mockResolvedValue(undefined) };
    service = new VerificationService(
      repo as unknown as VerificationRepository,
      opportunities as unknown as OpportunitiesService,
      audit as unknown as AuditService,
    );
  });

  it('hides reviewer/notes from the public view', async () => {
    const res = (await service.get('op-1')) as Record<string, unknown>;
    expect(res.tier).toBe('T3');
    expect(res.verifiedFields).toEqual(['ownership']);
    expect('reviewer' in res).toBe(false);
    expect('notes' in res).toBe(false);
    expect(res.canVerify).toBe(false);
  });

  it('exposes reviewer/notes to the owner', async () => {
    const res = (await service.get('op-1', owner)) as Record<string, unknown>;
    expect(res.reviewer).toBe('a@x.com');
    expect(res.notes).toBe('internal note');
  });

  it('marks canVerify true for an admin', async () => {
    const res = (await service.get('op-1', admin)) as Record<string, unknown>;
    expect(res.canVerify).toBe(true);
  });

  it('set() propagates the tier, upserts the record and audits', async () => {
    await service.set(admin, 'op-1', { tier: 'T4', verifiedFields: ['ownership'] });
    expect(opportunities.setVerification).toHaveBeenCalledWith('op-1', 'T4');
    expect(repo.upsert).toHaveBeenCalled();
    expect(audit.record).toHaveBeenCalled();
  });
});
