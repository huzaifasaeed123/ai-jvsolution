import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClarificationsService } from './clarifications.service';
import { ClarificationsRepository } from './clarifications.repository';
import { AuditService } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

const authority: AuthUser = { id: 'gov-1', email: 'g@x.com', role: 'GOVERNMENT', accessLevel: 'REGISTERED' };
const bidderA: AuthUser = { id: 'dev-1', email: 'a@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };
const bidderB: AuthUser = { id: 'dev-2', email: 'b@x.com', role: 'DEVELOPER', accessLevel: 'REGISTERED' };

const FUTURE = new Date(Date.now() + 7 * 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

const tender = (over = {}) => ({
  id: 't1', authorityId: 'gov-1', stage: 'PUBLISHED', opportunityId: 'op-1',
  clarificationDeadline: FUTURE, submissionDeadline: FUTURE, ...over,
});

const question = (over = {}) => ({
  id: 'q1', tenderId: 't1', askedById: 'dev-1', question: 'Is X in scope?',
  answer: null, answeredById: null, answeredAt: null, published: false,
  askedBy: { id: 'dev-1', fullName: 'A' }, createdAt: new Date(), updatedAt: new Date(), ...over,
});

const challenge = (over = {}) => ({
  id: 'c1', tenderId: 't1', originatorId: 'dev-1', status: 'OPEN',
  challengeWindowDays: 30, challengeDeadline: FUTURE, originatorMayMatch: true,
  outcomeNotes: null, decidedAt: null, createdAt: new Date(), updatedAt: new Date(), ...over,
});

describe('ClarificationsService', () => {
  let repo: jest.Mocked<Pick<ClarificationsRepository, 'getTender' | 'createQuestion' | 'findQuestion' | 'listQuestions' | 'updateQuestion' | 'nextAddendumNumber' | 'createAddendum' | 'listAddenda' | 'updateTenderDeadline' | 'findChallenge' | 'createChallenge' | 'updateChallenge' | 'userExists'>>;
  let audit: { record: jest.Mock };
  let service: ClarificationsService;

  beforeEach(() => {
    repo = {
      getTender: jest.fn().mockResolvedValue(tender()),
      createQuestion: jest.fn().mockResolvedValue(question()),
      findQuestion: jest.fn().mockResolvedValue(question()),
      listQuestions: jest.fn().mockResolvedValue([]),
      updateQuestion: jest.fn().mockImplementation((_id, d) => Promise.resolve(question(d))),
      nextAddendumNumber: jest.fn().mockResolvedValue(1),
      createAddendum: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'a1', ...d })),
      listAddenda: jest.fn().mockResolvedValue([]),
      updateTenderDeadline: jest.fn().mockResolvedValue({}),
      findChallenge: jest.fn().mockResolvedValue(null),
      createChallenge: jest.fn().mockImplementation((d) => Promise.resolve(challenge(d))),
      updateChallenge: jest.fn().mockImplementation((_id, d) => Promise.resolve(challenge(d))),
      userExists: jest.fn().mockResolvedValue({ id: 'dev-1' }),
    };
    audit = { record: jest.fn().mockResolvedValue(undefined) };
    service = new ClarificationsService(repo as unknown as ClarificationsRepository, audit as unknown as AuditService);
  });

  // ---- clarifications ----
  it('lets a bidder ask a question while the tender is open', async () => {
    const r = await service.ask(bidderA, 't1', { question: 'Is X in scope?' });
    expect(repo.createQuestion).toHaveBeenCalled();
    expect(r.published).toBe(false);
  });

  it('blocks the authority from asking its own tender a question', async () => {
    await expect(service.ask(authority, 't1', { question: 'x' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuses questions after the clarification deadline', async () => {
    repo.getTender.mockResolvedValue(tender({ clarificationDeadline: PAST }) as never);
    await expect(service.ask(bidderA, 't1', { question: 'x' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('PUBLISHES the answer to all bidders (fairness)', async () => {
    const r = await service.answer(authority, 'q1', { answer: 'Yes, in scope' });
    expect(repo.updateQuestion).toHaveBeenCalledWith('q1', expect.objectContaining({ published: true }));
    expect(r.published).toBe(true);
    expect(r.answer).toBe('Yes, in scope');
  });

  it('blocks a bidder from answering', async () => {
    await expect(service.answer(bidderA, 'q1', { answer: 'x' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses to answer twice', async () => {
    repo.findQuestion.mockResolvedValue(question({ answer: 'already' }) as never);
    await expect(service.answer(authority, 'q1', { answer: 'again' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('hides an unanswered rival question but shows published Q&A to everyone', async () => {
    repo.listQuestions.mockResolvedValue([
      question({ id: 'mine', askedById: 'dev-2' }),                       // rival, unanswered
      question({ id: 'pub', askedById: 'dev-1', answer: 'A', published: true }), // published
    ] as never);
    const seen = await service.listQuestions('t1', bidderB);
    const ids = seen.map((q) => q.id);
    expect(ids).toContain('pub');   // published visible to all
    expect(ids).toContain('mine');  // bidderB's own question visible to them
    const seenByA = await service.listQuestions('t1', bidderA);
    expect(seenByA.map((q) => q.id)).not.toContain('mine'); // rival's unanswered question hidden
  });

  // ---- addenda ----
  it('numbers addenda sequentially and extends the deadline when given', async () => {
    repo.nextAddendumNumber.mockResolvedValue(3);
    const newDeadline = new Date(Date.now() + 21 * 86_400_000).toISOString();
    const r = await service.issueAddendum(authority, 't1', { title: 'Scope change', description: 'Adds depot', newSubmissionDeadline: newDeadline });
    expect(r.number).toBe(3);
    expect(repo.updateTenderDeadline).toHaveBeenCalled();
  });

  it('blocks a bidder from issuing an addendum', async () => {
    await expect(service.issueAddendum(bidderA, 't1', { title: 'x', description: 'y' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses an addendum once the tender is closed', async () => {
    repo.getTender.mockResolvedValue(tender({ stage: 'UNDER_EVALUATION' }) as never);
    await expect(service.issueAddendum(authority, 't1', { title: 'x', description: 'y' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a revised deadline in the past', async () => {
    await expect(
      service.issueAddendum(authority, 't1', { title: 'x', description: 'y', newSubmissionDeadline: PAST.toISOString() }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ---- swiss challenge ----
  it('opens a challenge with a computed deadline', async () => {
    const r = await service.openChallenge(authority, 't1', { originatorId: 'dev-1', challengeWindowDays: 45 });
    expect(r.challengeWindowDays).toBe(45);
    expect(r.windowOpen).toBe(true);
  });

  it('refuses a second challenge on the same tender', async () => {
    repo.findChallenge.mockResolvedValue(challenge() as never);
    await expect(service.openChallenge(authority, 't1', { originatorId: 'dev-1' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses an unknown originator', async () => {
    repo.userExists.mockResolvedValue(null);
    await expect(service.openChallenge(authority, 't1', { originatorId: 'ghost' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('will not decide while the challenge window is still open', async () => {
    repo.findChallenge.mockResolvedValue(challenge() as never);
    await expect(service.decideChallenge(authority, 't1', { status: 'ORIGINAL_WINS' as never })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('decides once the window has closed', async () => {
    repo.findChallenge.mockResolvedValue(challenge({ challengeDeadline: PAST }) as never);
    const r = await service.decideChallenge(authority, 't1', { status: 'CHALLENGER_WINS' as never, outcomeNotes: 'Better price' });
    expect(r.status).toBe('CHALLENGER_WINS');
    expect(audit.record).toHaveBeenCalled();
  });
});
