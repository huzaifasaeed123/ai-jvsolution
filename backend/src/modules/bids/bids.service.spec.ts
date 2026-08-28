import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsRepository } from './bids.repository';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const authority: AuthUser = { id: 'gov-1', email: 'g@x.com', role: 'GOVERNMENT', accessLevel: 'REGISTERED' };
const bidder: AuthUser = { id: 'dev-1', email: 'd@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };
const rival: AuthUser = { id: 'dev-2', email: 'r@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };

const FUTURE = new Date(Date.now() + 7 * 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

function tender(over: Record<string, unknown> = {}) {
  return { id: 't1', authorityId: 'gov-1', stage: 'PUBLISHED', submissionDeadline: FUTURE, opportunityId: 'op-1', currency: 'USD', ...over };
}

function bid(over: Record<string, unknown> = {}) {
  return {
    id: 'b1', reference: 'BID-ABC', tenderId: 't1', bidderId: 'dev-1', consortiumId: null,
    status: 'DRAFT', technicalProposal: 'secret method', methodology: 'secret',
    deliveryMonths: 30, experienceYears: 12, keyPersonnel: 'names', localContentPct: 40,
    currency: 'USD', bidPriceCents: 100_000_000n, annualPaymentCents: null, revenueSharePct: 5,
    financialCapacityCents: null, bidSecurityProvided: true, checklistComplete: true,
    declarations: 'x', submittedAt: null, withdrawnAt: null, disqualifiedReason: null,
    createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    bidder: { id: 'dev-1', fullName: 'Dev', email: 'd@x.com', companyId: null },
    consortium: null,
    tender: { id: 't1', reference: 'TND-1', title: 'T', stage: 'PUBLISHED', authorityId: 'gov-1', submissionDeadline: FUTURE, currency: 'USD', evaluationCriteria: [] },
    ...over,
  };
}

describe('BidsService', () => {
  let repo: jest.Mocked<Pick<BidsRepository, 'getTender' | 'getConsortium' | 'create' | 'findById' | 'findExisting' | 'findForTender' | 'update'>>;
  let audit: { record: jest.Mock };
  let service: BidsService;

  beforeEach(() => {
    repo = {
      getTender: jest.fn().mockResolvedValue(tender()),
      getConsortium: jest.fn().mockResolvedValue({ id: 'c1', leadId: 'dev-1', status: 'ACTIVE' }),
      create: jest.fn().mockResolvedValue(bid()),
      findById: jest.fn().mockResolvedValue(bid()),
      findExisting: jest.fn().mockResolvedValue(null),
      findForTender: jest.fn().mockResolvedValue([bid({ status: 'SUBMITTED' })]),
      update: jest.fn().mockImplementation((_id, data) => Promise.resolve(bid(data))),
    };
    audit = { record: jest.fn().mockResolvedValue(undefined) };
    service = new BidsService(repo as unknown as BidsRepository, audit as unknown as AuditService);
  });

  it('lets a bidder start a bid on an open tender', async () => {
    const r = await service.create(bidder, 't1', { bidPrice: 1_000_000 });
    expect(repo.create).toHaveBeenCalled();
    expect(r.reference).toMatch(/^BID-/);
  });

  it('blocks the authority from bidding on its own tender', async () => {
    await expect(service.create(authority, 't1', {})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses a bid after the submission deadline', async () => {
    repo.getTender.mockResolvedValue(tender({ submissionDeadline: PAST }) as never);
    await expect(service.create(bidder, 't1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a bid when the tender is not open', async () => {
    repo.getTender.mockResolvedValue(tender({ stage: 'UNDER_EVALUATION' }) as never);
    await expect(service.create(bidder, 't1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses a duplicate bid from the same bidder', async () => {
    repo.findExisting.mockResolvedValue(bid() as never);
    await expect(service.create(bidder, 't1', {})).rejects.toBeInstanceOf(ConflictException);
  });

  it('only the consortium lead may bid on its behalf', async () => {
    repo.getConsortium.mockResolvedValue({ id: 'c1', leadId: 'someone-else', status: 'ACTIVE' } as never);
    await expect(service.create(bidder, 't1', { consortiumId: 'c1' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires bid security and a complete checklist before submitting', async () => {
    repo.findById.mockResolvedValue(bid({ bidSecurityProvided: false }) as never);
    await expect(service.submit(bidder, 'b1')).rejects.toBeInstanceOf(BadRequestException);
    repo.findById.mockResolvedValue(bid({ checklistComplete: false }) as never);
    await expect(service.submit(bidder, 'b1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('submits a compliant bid and stamps submittedAt', async () => {
    const r = await service.submit(bidder, 'b1');
    expect(r.status).toBe('SUBMITTED');
    expect(r.submittedAt).toBeTruthy();
    expect(audit.record).toHaveBeenCalled();
  });

  it('SEALS bid contents from the authority before the deadline', async () => {
    const res = await service.listForTender(authority, 't1');
    expect(res.sealed).toBe(true);
    const first = res.bids[0] as Record<string, unknown>;
    expect(first.reference).toBe('BID-ABC'); // existence is visible
    expect(first.bidSecurityProvided).toBe(true); // compliance is visible
    expect('technicalProposal' in first).toBe(false); // contents are NOT
    expect('bidPrice' in first).toBe(false);
  });

  it('unseals contents for the authority after the deadline', async () => {
    repo.getTender.mockResolvedValue(tender({ submissionDeadline: PAST }) as never);
    repo.findForTender.mockResolvedValue([bid({ status: 'SUBMITTED', tender: { ...bid().tender, submissionDeadline: PAST } })] as never);
    const res = await service.listForTender(authority, 't1');
    expect(res.sealed).toBe(false);
    const first = res.bids[0] as Record<string, unknown>;
    expect(first.technicalProposal).toBe('secret method');
    expect(first.bidPrice).toBe(1_000_000);
  });

  it('always shows a bidder their own full bid', async () => {
    const r = (await service.getOne(bidder, 'b1')) as Record<string, unknown>;
    expect(r.sealed).toBe(false);
    expect(r.technicalProposal).toBe('secret method');
  });

  it('blocks a rival bidder from reading another bid', async () => {
    await expect(service.getOne(rival, 'b1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses withdrawal after the deadline', async () => {
    repo.findById.mockResolvedValue(bid({ tender: { ...bid().tender, submissionDeadline: PAST } }) as never);
    await expect(service.withdraw(bidder, 'b1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lets the authority disqualify with a reason', async () => {
    const r = await service.disqualify(authority, 'b1', 'No bid bond');
    expect(r.status).toBe('DISQUALIFIED');
    expect(r.disqualifiedReason).toBe('No bid bond');
  });

  it('blocks a non-authority from disqualifying', async () => {
    await expect(service.disqualify(rival, 'b1', 'x')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
