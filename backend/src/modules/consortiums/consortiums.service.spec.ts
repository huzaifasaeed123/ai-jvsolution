import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConsortiumsService } from './consortiums.service';
import { ConsortiumsRepository } from './consortiums.repository';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const lead: AuthUser = { id: 'lead-1', email: 'l@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };
const other: AuthUser = { id: 'other-9', email: 'o@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };
const invited: AuthUser = { id: 'inv-1', email: 'i@x.com', role: 'INVESTOR', accessLevel: 'REGISTERED' };

function detail(over: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    name: 'C',
    description: null,
    opportunityId: null,
    opportunity: null,
    leadId: 'lead-1',
    lead: { id: 'lead-1', fullName: 'Lead', email: 'l@x.com' },
    status: 'FORMING',
    members: [{ id: 'm-lead', userId: 'lead-1', role: 'lead-investor', equityPct: 50, status: 'ACCEPTED', user: { id: 'lead-1', fullName: 'Lead', email: 'l@x.com' } }],
    createdAt: new Date(),
    ...over,
  };
}

describe('ConsortiumsService', () => {
  let repo: jest.Mocked<Pick<ConsortiumsRepository, 'findDetail' | 'findUserByEmail' | 'findMembership' | 'addMember' | 'findMember' | 'updateMember'>>;
  let service: ConsortiumsService;

  beforeEach(() => {
    repo = {
      findDetail: jest.fn().mockResolvedValue(detail()),
      findUserByEmail: jest.fn().mockResolvedValue({ id: 'inv-1' }),
      findMembership: jest.fn().mockResolvedValue(null),
      addMember: jest.fn().mockResolvedValue({}),
      findMember: jest.fn(),
      updateMember: jest.fn().mockResolvedValue({}),
    };
    service = new ConsortiumsService(repo as unknown as ConsortiumsRepository);
  });

  it('lets the lead invite a registered user', async () => {
    const r = await service.invite(lead, 'c1', { email: 'i@x.com', role: 'operator', equityPct: 20 });
    expect(repo.addMember).toHaveBeenCalled();
    expect(r.id).toBe('c1');
  });

  it('blocks a non-lead from inviting', async () => {
    await expect(service.invite(other, 'c1', { email: 'i@x.com', role: 'operator' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects inviting an email that is not registered', async () => {
    repo.findUserByEmail.mockResolvedValue(null);
    await expect(service.invite(lead, 'c1', { email: 'x@y.com', role: 'operator' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects inviting an existing member', async () => {
    repo.findMembership.mockResolvedValue({ status: 'ACCEPTED' } as never);
    await expect(service.invite(lead, 'c1', { email: 'i@x.com', role: 'operator' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('lets the invited user accept, but not someone else', async () => {
    repo.findMember.mockResolvedValue({ id: 'm2', userId: 'inv-1', consortiumId: 'c1', status: 'INVITED' } as never);
    await expect(service.respond(other, 'm2', true)).rejects.toBeInstanceOf(ForbiddenException);
    // After accepting, getOne reloads the detail — include the invited member.
    repo.findDetail.mockResolvedValue(detail({
      members: [
        { id: 'm-lead', userId: 'lead-1', role: 'lead-investor', equityPct: 50, status: 'ACCEPTED', user: { id: 'lead-1', fullName: 'Lead', email: 'l@x.com' } },
        { id: 'm2', userId: 'inv-1', role: 'operator', equityPct: 20, status: 'ACCEPTED', user: { id: 'inv-1', fullName: 'Inv', email: 'i@x.com' } },
      ],
    }) as never);
    const r = await service.respond(invited, 'm2', true);
    expect(repo.updateMember).toHaveBeenCalledWith('m2', { status: 'ACCEPTED' });
    expect(r.id).toBe('c1');
  });

  it('cannot answer an already-answered invitation', async () => {
    repo.findMember.mockResolvedValue({ id: 'm2', userId: 'inv-1', consortiumId: 'c1', status: 'ACCEPTED' } as never);
    await expect(service.respond(invited, 'm2', true)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('computes total committed equity in the serialized detail', async () => {
    repo.findDetail.mockResolvedValue(detail({
      members: [
        { id: 'a', userId: 'lead-1', role: 'lead-investor', equityPct: 50, status: 'ACCEPTED', user: { id: 'lead-1', fullName: 'L', email: 'l@x.com' } },
        { id: 'b', userId: 'inv-1', role: 'operator', equityPct: 30, status: 'ACCEPTED', user: { id: 'inv-1', fullName: 'I', email: 'i@x.com' } },
      ],
    }) as never);
    const r = await service.getOne(lead, 'c1');
    expect(r.totalEquity).toBe(80);
    expect(r.isLead).toBe(true);
  });
});
