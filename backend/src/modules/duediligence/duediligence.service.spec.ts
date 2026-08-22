import { ForbiddenException } from '@nestjs/common';
import { DueDiligenceService } from './duediligence.service';
import { DueDiligenceRepository } from './duediligence.repository';
import { AccessService } from '../access/access.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const owner: AuthUser = { id: 'own-1', email: 'o@x.com', role: 'OWNER', accessLevel: 'REGISTERED' };
const granted: AuthUser = { id: 'dev-1', email: 'd@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };
const stranger: AuthUser = { id: 'eve-9', email: 'e@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };

describe('DueDiligenceService (permissions + summary)', () => {
  let repo: jest.Mocked<Pick<DueDiligenceRepository, 'getOpportunityMeta' | 'list' | 'findById' | 'update'>>;
  let access: { hasAccess: jest.Mock };
  let service: DueDiligenceService;

  beforeEach(() => {
    repo = {
      getOpportunityMeta: jest.fn().mockResolvedValue({ id: 'op-1', ownerId: 'own-1', status: 'PUBLISHED' }),
      list: jest.fn().mockResolvedValue([
        { id: 'i1', opportunityId: 'op-1', category: 'legal', title: 'Deed', riskRating: 'HIGH', closure: 'OPEN' },
        { id: 'i2', opportunityId: 'op-1', category: 'tax', title: 'Tax', riskRating: null, closure: 'CLOSED' },
      ]),
      findById: jest.fn().mockResolvedValue({ id: 'i1', opportunityId: 'op-1' }),
      update: jest.fn().mockResolvedValue({ id: 'i1' }),
    };
    access = { hasAccess: jest.fn() };
    service = new DueDiligenceService(repo as unknown as DueDiligenceRepository, access as unknown as AccessService);
  });

  it('blocks a non-granted user from viewing', async () => {
    access.hasAccess.mockResolvedValue(false);
    await expect(service.list(stranger, 'op-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets a granted user view read-only with a risk summary', async () => {
    access.hasAccess.mockResolvedValue(true);
    const res = await service.list(granted, 'op-1');
    expect(res.canEdit).toBe(false);
    expect(res.summary.total).toBe(2);
    expect(res.summary.open).toBe(1);
    expect(res.summary.closed).toBe(1);
    expect(res.summary.byRisk).toEqual({ HIGH: 1 });
  });

  it('lets the owner edit', async () => {
    const res = await service.list(owner, 'op-1');
    expect(res.canEdit).toBe(true);
  });

  it('blocks a non-owner from editing an item', async () => {
    await expect(service.update(granted, 'i1', { riskRating: 'LOW' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
