import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BidStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { BidsRepository, BidDetail } from './bids.repository';
import { BidSerializer } from './bid.serializer';
import { AuditService, AuditAction } from '../access/audit.service';
import { CreateBidDto, UpdateBidDto } from './dto/bid.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

function majorToCents(major?: number): bigint | undefined {
  return major === undefined ? undefined : BigInt(Math.round(major * 100));
}

/** Stages during which a tender accepts bids. */
const OPEN_STAGES = ['PUBLISHED', 'CLARIFICATION'];

@Injectable()
export class BidsService {
  constructor(
    private readonly repo: BidsRepository,
    private readonly audit: AuditService,
  ) {}

  // ---- bidder actions ----

  async create(user: AuthUser, tenderId: string, dto: CreateBidDto) {
    const tender = await this.tenderOr404(tenderId);
    if (tender.authorityId === user.id) {
      throw new ForbiddenException('The publishing authority cannot bid on its own tender');
    }
    if (!OPEN_STAGES.includes(tender.stage)) {
      throw new BadRequestException('This tender is not open for bids');
    }
    this.assertDeadlineNotPassed(tender.submissionDeadline);

    const existing = await this.repo.findExisting(tenderId, user.id);
    if (existing && existing.deletedAt === null) {
      throw new ConflictException('You already have a bid on this tender — update it instead');
    }

    // A consortium bid must come from its lead.
    if (dto.consortiumId) {
      const c = await this.repo.getConsortium(dto.consortiumId);
      if (!c) throw new NotFoundException('Consortium not found');
      if (c.leadId !== user.id) throw new ForbiddenException('Only the consortium lead can bid on its behalf');
      if (c.status === 'DISBANDED') throw new BadRequestException('That consortium is disbanded');
    }

    const created = await this.repo.create({
      reference: `BID-${randomBytes(3).toString('hex').toUpperCase()}`,
      tender: { connect: { id: tenderId } },
      bidder: { connect: { id: user.id } },
      ...(dto.consortiumId ? { consortium: { connect: { id: dto.consortiumId } } } : {}),
      ...this.envelopeData(dto, tender.currency),
    });

    await this.audit.record({
      actorId: user.id,
      action: AuditAction.BID_CREATED,
      opportunityId: tender.opportunityId,
      metadata: { bidId: created.id, tenderId },
    });
    return BidSerializer.toUnsealed(created);
  }

  async update(user: AuthUser, bidId: string, dto: UpdateBidDto) {
    const bid = await this.mustBidder(user, bidId);
    if (!['DRAFT', 'SUBMITTED'].includes(bid.status)) {
      throw new BadRequestException('This bid can no longer be edited');
    }
    this.assertDeadlineNotPassed(bid.tender.submissionDeadline);

    const updated = await this.repo.update(bidId, this.envelopeData(dto, bid.currency));
    return BidSerializer.toUnsealed(updated);
  }

  /** Seal and submit. After this the authority sees only that it exists. */
  async submit(user: AuthUser, bidId: string) {
    const bid = await this.mustBidder(user, bidId);
    if (bid.status !== BidStatus.DRAFT) {
      throw new BadRequestException('Only a draft bid can be submitted');
    }
    if (!OPEN_STAGES.includes(bid.tender.stage)) {
      throw new BadRequestException('This tender is not open for bids');
    }
    this.assertDeadlineNotPassed(bid.tender.submissionDeadline);

    // Submission checklist (spec §13) — mandatory before the bid counts.
    if (!bid.bidSecurityProvided) {
      throw new BadRequestException('Bid security must be provided before submission');
    }
    if (!bid.checklistComplete) {
      throw new BadRequestException('Complete the submission checklist before submitting');
    }

    const updated = await this.repo.update(bidId, {
      status: BidStatus.SUBMITTED,
      submittedAt: new Date(),
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.BID_SUBMITTED,
      opportunityId: bid.tender.id,
      metadata: { bidId, tenderId: bid.tenderId, reference: bid.reference },
    });
    return BidSerializer.toUnsealed(updated);
  }

  async withdraw(user: AuthUser, bidId: string) {
    const bid = await this.mustBidder(user, bidId);
    if (['WITHDRAWN', 'DISQUALIFIED'].includes(bid.status)) {
      throw new BadRequestException('This bid is already closed');
    }
    // Withdrawing after the deadline would let a bidder escape a binding offer.
    this.assertDeadlineNotPassed(bid.tender.submissionDeadline, 'Bids cannot be withdrawn after the deadline');

    const updated = await this.repo.update(bidId, {
      status: BidStatus.WITHDRAWN,
      withdrawnAt: new Date(),
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.BID_WITHDRAWN,
      opportunityId: bid.tender.id,
      metadata: { bidId, tenderId: bid.tenderId },
    });
    return BidSerializer.toUnsealed(updated);
  }

  async listMine(user: AuthUser) {
    const items = await this.repo.findMine(user.id);
    return items.map((b) => BidSerializer.toUnsealed(b));
  }

  // ---- authority actions ----

  /**
   * The authority's view of received bids. SEALED until the submission deadline
   * passes — before then only existence and compliance flags are returned.
   */
  async listForTender(user: AuthUser, tenderId: string) {
    const tender = await this.tenderOr404(tenderId);
    if (user.role !== 'ADMIN' && tender.authorityId !== user.id) {
      throw new ForbiddenException('Only the publishing authority can view bids');
    }
    const bids = await this.repo.findForTender(tenderId);
    const open = this.isSealed(tender.submissionDeadline);
    return {
      sealed: open,
      submissionDeadline: tender.submissionDeadline,
      count: bids.length,
      bids: bids.map((b) => (open ? BidSerializer.toSealed(b) : BidSerializer.toUnsealed(b))),
    };
  }

  async getOne(user: AuthUser, bidId: string) {
    const bid = await this.repo.findById(bidId);
    if (!bid) throw new NotFoundException('Bid not found');

    if (bid.bidderId === user.id) return BidSerializer.toUnsealed(bid);

    const isAuthority = user.role === 'ADMIN' || bid.tender.authorityId === user.id;
    if (!isAuthority) throw new ForbiddenException('You do not have access to this bid');

    return this.isSealed(bid.tender.submissionDeadline)
      ? BidSerializer.toSealed(bid)
      : BidSerializer.toUnsealed(bid);
  }

  async disqualify(user: AuthUser, bidId: string, reason: string) {
    const bid = await this.repo.findById(bidId);
    if (!bid) throw new NotFoundException('Bid not found');
    if (user.role !== 'ADMIN' && bid.tender.authorityId !== user.id) {
      throw new ForbiddenException('Only the publishing authority can disqualify a bid');
    }
    const updated = await this.repo.update(bidId, {
      status: BidStatus.DISQUALIFIED,
      disqualifiedReason: reason,
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.BID_DISQUALIFIED,
      opportunityId: bid.tender.id,
      metadata: { bidId, reason },
    });
    return BidSerializer.toUnsealed(updated);
  }

  // ---- helpers ----

  /** Shared envelope fields — plain scalars, so this works for create and update. */
  private envelopeData(dto: UpdateBidDto, fallbackCurrency: string) {
    return {
      technicalProposal: dto.technicalProposal,
      methodology: dto.methodology,
      deliveryMonths: dto.deliveryMonths,
      experienceYears: dto.experienceYears,
      keyPersonnel: dto.keyPersonnel,
      localContentPct: dto.localContentPct,
      currency: dto.currency?.toUpperCase() ?? fallbackCurrency,
      bidPriceCents: majorToCents(dto.bidPrice),
      annualPaymentCents: majorToCents(dto.annualPayment),
      revenueSharePct: dto.revenueSharePct,
      financialCapacityCents: majorToCents(dto.financialCapacity),
      bidSecurityProvided: dto.bidSecurityProvided,
      checklistComplete: dto.checklistComplete,
      declarations: dto.declarations,
    };
  }

  /** True while bids must remain sealed (deadline set and not yet passed). */
  private isSealed(deadline: Date | null): boolean {
    return deadline !== null && deadline.getTime() > Date.now();
  }

  private assertDeadlineNotPassed(deadline: Date | null, message = 'The submission deadline has passed') {
    if (deadline && deadline.getTime() <= Date.now()) {
      throw new BadRequestException(message);
    }
  }

  private async tenderOr404(id: string) {
    const t = await this.repo.getTender(id);
    if (!t) throw new NotFoundException('Tender not found');
    return t;
  }

  private async mustBidder(user: AuthUser, bidId: string): Promise<BidDetail> {
    const bid = await this.repo.findById(bidId);
    if (!bid) throw new NotFoundException('Bid not found');
    if (bid.bidderId !== user.id) throw new ForbiddenException('This bid is not yours');
    return bid;
  }
}
