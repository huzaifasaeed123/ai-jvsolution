import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChallengeStatus, Prisma } from '@prisma/client';
import { ClarificationsRepository, ClarificationWithAsker } from './clarifications.repository';
import { AuditService, AuditAction } from '../access/audit.service';
import {
  AskClarificationDto,
  AnswerClarificationDto,
  IssueAddendumDto,
  OpenChallengeDto,
  DecideChallengeDto,
} from './dto/clarification.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

/** Stages during which questions may still be asked. */
const QUESTION_STAGES = ['PUBLISHED', 'CLARIFICATION'];

@Injectable()
export class ClarificationsService {
  constructor(
    private readonly repo: ClarificationsRepository,
    private readonly audit: AuditService,
  ) {}

  // ================= Clarifications =================

  async ask(user: AuthUser, tenderId: string, dto: AskClarificationDto) {
    const tender = await this.tenderOr404(tenderId);
    if (tender.authorityId === user.id) {
      throw new BadRequestException('The authority answers clarifications, it does not ask them');
    }
    if (!QUESTION_STAGES.includes(tender.stage)) {
      throw new BadRequestException('This tender is not accepting clarification questions');
    }
    const cutoff = tender.clarificationDeadline ?? tender.submissionDeadline;
    if (cutoff && cutoff.getTime() <= Date.now()) {
      throw new BadRequestException('The clarification deadline has passed');
    }

    const created = await this.repo.createQuestion({
      tender: { connect: { id: tenderId } },
      askedBy: { connect: { id: user.id } },
      question: dto.question,
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.CLARIFICATION_ASKED,
      opportunityId: tender.opportunityId,
      metadata: { tenderId, clarificationId: created.id },
    });
    return this.serializeQuestion(created, user);
  }

  /**
   * Answering publishes the Q&A to EVERY bidder (spec §13). Private guidance to
   * one bidder would distort the field, so publication is not optional.
   */
  async answer(user: AuthUser, clarificationId: string, dto: AnswerClarificationDto) {
    const q = await this.repo.findQuestion(clarificationId);
    if (!q) throw new NotFoundException('Clarification not found');
    const tender = await this.tenderOr404(q.tenderId);
    if (user.role !== 'ADMIN' && tender.authorityId !== user.id) {
      throw new ForbiddenException('Only the publishing authority can answer clarifications');
    }
    if (q.answer) throw new BadRequestException('This question has already been answered');

    const updated = await this.repo.updateQuestion(clarificationId, {
      answer: dto.answer,
      answeredById: user.id,
      answeredAt: new Date(),
      published: true, // fairness: an answer is always public to bidders
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.CLARIFICATION_ANSWERED,
      opportunityId: tender.opportunityId,
      metadata: { tenderId: q.tenderId, clarificationId },
    });
    return this.serializeQuestion(updated, user);
  }

  /**
   * Q&A list. Published answers are visible to all; an unanswered question is
   * visible only to its asker and the authority (so bidders can't infer a
   * rival's line of enquiry before it is formally published).
   */
  async listQuestions(tenderId: string, user?: AuthUser) {
    const tender = await this.tenderOr404(tenderId);
    const isAuthority = !!user && (user.role === 'ADMIN' || tender.authorityId === user.id);
    const rows = await this.repo.listQuestions(tenderId);
    return rows
      .filter((q) => q.published || isAuthority || (user && q.askedById === user.id))
      .map((q) => this.serializeQuestion(q, user));
  }

  // ================= Addenda =================

  async issueAddendum(user: AuthUser, tenderId: string, dto: IssueAddendumDto) {
    const tender = await this.tenderOr404(tenderId);
    if (user.role !== 'ADMIN' && tender.authorityId !== user.id) {
      throw new ForbiddenException('Only the publishing authority can issue an addendum');
    }
    // Amending terms after bids close would undermine the process.
    if (!QUESTION_STAGES.includes(tender.stage)) {
      throw new BadRequestException('Addenda can only be issued while the tender is open');
    }

    const number = await this.repo.nextAddendumNumber(tenderId);
    const newDeadline = dto.newSubmissionDeadline ? new Date(dto.newSubmissionDeadline) : null;
    if (newDeadline && newDeadline.getTime() <= Date.now()) {
      throw new BadRequestException('A revised submission deadline must be in the future');
    }

    const created = await this.repo.createAddendum({
      tender: { connect: { id: tenderId } },
      number,
      title: dto.title,
      description: dto.description,
      newSubmissionDeadline: newDeadline,
      issuedById: user.id,
    });

    // An addendum that extends the deadline actually moves it.
    if (newDeadline) await this.repo.updateTenderDeadline(tenderId, newDeadline);

    await this.audit.record({
      actorId: user.id,
      action: AuditAction.ADDENDUM_ISSUED,
      opportunityId: tender.opportunityId,
      metadata: { tenderId, addendumId: created.id, number, deadlineChanged: !!newDeadline },
    });
    return created;
  }

  /** Addenda are public — every bidder must see the same amended terms. */
  async listAddenda(tenderId: string) {
    await this.tenderOr404(tenderId);
    return this.repo.listAddenda(tenderId);
  }

  // ================= Swiss Challenge =================

  async openChallenge(user: AuthUser, tenderId: string, dto: OpenChallengeDto) {
    const tender = await this.tenderOr404(tenderId);
    if (user.role !== 'ADMIN' && tender.authorityId !== user.id) {
      throw new ForbiddenException('Only the publishing authority can open a Swiss Challenge');
    }
    const existing = await this.repo.findChallenge(tenderId);
    if (existing) throw new ConflictException('This tender already has a Swiss Challenge');

    const originator = await this.repo.userExists(dto.originatorId);
    if (!originator) throw new NotFoundException('Originator not found');

    const days = dto.challengeWindowDays ?? 30;
    const created = await this.repo.createChallenge({
      tender: { connect: { id: tenderId } },
      originator: { connect: { id: dto.originatorId } },
      challengeWindowDays: days,
      challengeDeadline: new Date(Date.now() + days * 86_400_000),
      originatorMayMatch: dto.originatorMayMatch ?? true,
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.CHALLENGE_OPENED,
      opportunityId: tender.opportunityId,
      metadata: { tenderId, challengeId: created.id, windowDays: days },
    });
    return this.serializeChallenge(created);
  }

  async getChallenge(tenderId: string) {
    await this.tenderOr404(tenderId);
    const c = await this.repo.findChallenge(tenderId);
    return c ? this.serializeChallenge(c) : null;
  }

  async decideChallenge(user: AuthUser, tenderId: string, dto: DecideChallengeDto) {
    const tender = await this.tenderOr404(tenderId);
    if (user.role !== 'ADMIN' && tender.authorityId !== user.id) {
      throw new ForbiddenException('Only the publishing authority can decide a Swiss Challenge');
    }
    const c = await this.repo.findChallenge(tenderId);
    if (!c) throw new NotFoundException('No Swiss Challenge on this tender');
    if (c.status !== ChallengeStatus.OPEN && c.status !== ChallengeStatus.CLOSED) {
      throw new BadRequestException('This challenge has already been decided');
    }
    if (
      dto.status !== ChallengeStatus.ORIGINAL_WINS &&
      dto.status !== ChallengeStatus.CHALLENGER_WINS &&
      dto.status !== ChallengeStatus.CANCELLED
    ) {
      throw new BadRequestException('Invalid challenge outcome');
    }
    // Deciding before the window closes would defeat the point of the challenge.
    if (dto.status !== ChallengeStatus.CANCELLED && c.challengeDeadline.getTime() > Date.now()) {
      throw new BadRequestException('The challenge window is still open');
    }

    const updated = await this.repo.updateChallenge(c.id, {
      status: dto.status,
      outcomeNotes: dto.outcomeNotes,
      decidedAt: new Date(),
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.CHALLENGE_DECIDED,
      opportunityId: tender.opportunityId,
      metadata: { tenderId, challengeId: c.id, outcome: dto.status },
    });
    return this.serializeChallenge(updated);
  }

  // ================= helpers =================

  private serializeQuestion(q: ClarificationWithAsker, user?: AuthUser) {
    return {
      id: q.id,
      tenderId: q.tenderId,
      question: q.question,
      answer: q.answer,
      published: q.published,
      answeredAt: q.answeredAt,
      // The asker's identity is not revealed to other bidders.
      askedByMe: !!user && q.askedById === user.id,
      createdAt: q.createdAt,
    };
  }

  private serializeChallenge(c: Prisma.SwissChallengeGetPayload<object>) {
    const remaining = c.challengeDeadline.getTime() - Date.now();
    return {
      id: c.id,
      tenderId: c.tenderId,
      originatorId: c.originatorId,
      status: c.status,
      challengeWindowDays: c.challengeWindowDays,
      challengeDeadline: c.challengeDeadline,
      originatorMayMatch: c.originatorMayMatch,
      windowOpen: c.status === ChallengeStatus.OPEN && remaining > 0,
      daysRemaining: Math.max(0, Math.ceil(remaining / 86_400_000)),
      outcomeNotes: c.outcomeNotes,
      decidedAt: c.decidedAt,
    };
  }

  private async tenderOr404(id: string) {
    const t = await this.repo.getTender(id);
    if (!t) throw new NotFoundException('Tender not found');
    return t;
  }
}
