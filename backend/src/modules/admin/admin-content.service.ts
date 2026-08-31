import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OpportunityStatus, Prisma, TenderStage } from '@prisma/client';
import { AdminRepository } from './admin.repository';
import { AuditService, AuditAction } from '../access/audit.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { QueryOpportunitiesDto, QueryTendersDto } from './dto/query-content.dto';

/** Money is stored in minor units; admin tables show major. */
function toMajor(cents: bigint | null): number | null {
  return cents === null ? null : Number(cents) / 100;
}

type Row = Record<string, unknown> & {
  projectValueCents?: bigint | null;
  estimatedValueCents?: bigint | null;
};

function serializeOpportunity<T extends Row>(o: T) {
  const { projectValueCents, ...rest } = o;
  return { ...rest, projectValue: toMajor(projectValueCents ?? null) };
}

function serializeTender<T extends Row>(t: T) {
  const { estimatedValueCents, ...rest } = t;
  return { ...rest, estimatedValue: toMajor(estimatedValueCents ?? null) };
}

/**
 * Content moderation.
 *
 * Moderation here is reversible by design. Taking a listing off the market
 * moves it back to draft rather than destroying it, so a disputed decision can
 * be undone and the owner keeps their work. Every action records a reason,
 * because "why was my listing removed?" is a question the operator must be able
 * to answer months later.
 */
@Injectable()
export class AdminContentService {
  constructor(
    private readonly repo: AdminRepository,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------- opportunities

  async listOpportunities(query: QueryOpportunitiesDto) {
    const where: Prisma.OpportunityWhereInput = {};
    // Unlike every public query, deleted rows are visible — but only on request.
    if (!query.includeDeleted) where.deletedAt = null;
    if (query.status) where.status = query.status;
    if (query.verification) where.verification = query.verification;
    if (query.countryCode) where.countryCode = query.countryCode.toUpperCase();
    if (query.sector) where.sector = query.sector;
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const [items, total] = await this.repo.findOpportunities(where, (page - 1) * limit, limit);

    return {
      items: items.map(serializeOpportunity),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getOpportunity(id: string) {
    const o = await this.repo.findOpportunity(id);
    if (!o) throw new NotFoundException('Opportunity not found');
    return serializeOpportunity(o);
  }

  /**
   * Take a listing off the market without destroying it. It returns to the
   * owner as a draft, so they can correct whatever prompted the takedown.
   */
  async unpublish(actor: AuthUser, id: string, reason: string) {
    const o = await this.mustExist(id);
    const removable: OpportunityStatus[] = [
      OpportunityStatus.PUBLISHED,
      OpportunityStatus.MATCHED,
    ];
    if (!removable.includes(o.status)) {
      throw new BadRequestException(
        `Only a published or matched listing can be unpublished — this one is ${o.status.toLowerCase()}.`,
      );
    }

    const updated = await this.repo.updateOpportunity(id, {
      status: OpportunityStatus.DRAFT,
    });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.OPPORTUNITY_UNPUBLISHED,
      opportunityId: id,
      targetUserId: o.owner.id,
      metadata: { reason, previousStatus: o.status },
    });
    return serializeOpportunity(updated);
  }

  /** Retire a listing permanently. Still reversible via restore. */
  async archive(actor: AuthUser, id: string, reason: string) {
    const o = await this.mustExist(id);
    if (o.status === OpportunityStatus.ARCHIVED) {
      throw new BadRequestException('This listing is already archived');
    }

    const updated = await this.repo.updateOpportunity(id, {
      status: OpportunityStatus.ARCHIVED,
    });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.OPPORTUNITY_ARCHIVED,
      opportunityId: id,
      targetUserId: o.owner.id,
      metadata: { reason, previousStatus: o.status },
    });
    return serializeOpportunity(updated);
  }

  /**
   * Undo a takedown. The listing comes back as a draft rather than straight to
   * the market, so republishing stays the owner's decision.
   */
  async restore(actor: AuthUser, id: string) {
    const o = await this.repo.findOpportunity(id);
    if (!o) throw new NotFoundException('Opportunity not found');
    if (o.status !== OpportunityStatus.ARCHIVED && !o.deletedAt) {
      throw new BadRequestException('This listing is neither archived nor deleted');
    }

    const updated = await this.repo.updateOpportunity(id, {
      status: OpportunityStatus.DRAFT,
      deletedAt: null,
    });
    await this.audit.record({
      actorId: actor.id,
      action: AuditAction.OPPORTUNITY_RESTORED,
      opportunityId: id,
      targetUserId: o.owner.id,
      metadata: { previousStatus: o.status, wasDeleted: !!o.deletedAt },
    });
    return serializeOpportunity(updated);
  }

  // ------------------------------------------------------------ verification

  /**
   * The review backlog. The verification module could set a tier but had no way
   * to find what still needed one, which meant the queue only existed in
   * someone's head.
   */
  async verificationQueue(limit = 50) {
    const rows = await this.repo.verificationQueue(limit);
    return {
      total: rows.length,
      items: rows.map((o) => {
        const rec = o.verificationRecord;
        return {
          ...serializeOpportunity(o),
          neverReviewed: !rec,
          unresolvedCount: rec?.unresolvedItems.length ?? 0,
          verifiedCount: rec?.verifiedFields.length ?? 0,
          reviewedAt: rec?.reviewedAt ?? null,
          reviewerName: rec?.reviewerName ?? null,
          // Why this listing is in the queue, so the reviewer can triage.
          reason: !rec
            ? 'Never reviewed'
            : o.verification === 'T0' || o.verification === 'T1'
              ? 'Self-declared only'
              : 'Unresolved items outstanding',
        };
      }),
    };
  }

  // ----------------------------------------------------------------- tenders

  async listTenders(query: QueryTendersDto) {
    const where: Prisma.TenderWhereInput = {};
    if (!query.includeDeleted) where.deletedAt = null;
    if (query.stage) where.stage = query.stage;
    if (query.authorityId) where.authorityId = query.authorityId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const [items, total] = await this.repo.findTenders(where, (page - 1) * limit, limit);

    const now = Date.now();
    return {
      items: items.map((t) => ({
        ...serializeTender(t),
        bidCount: t._count.bids,
        // Live procurements past their deadline need an operator's attention.
        deadlinePassed: t.submissionDeadline ? t.submissionDeadline.getTime() < now : false,
        stalled:
          !!t.submissionDeadline &&
          t.submissionDeadline.getTime() < now &&
          ([TenderStage.PUBLISHED, TenderStage.CLARIFICATION] as TenderStage[]).includes(t.stage),
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  // ---------------------------------------------------------------- overview

  async counts() {
    const [opportunities, tenders] = await Promise.all([
      this.repo.opportunityCounts(),
      this.repo.tenderCounts(),
    ]);
    return { opportunities, tenders };
  }

  private async mustExist(id: string) {
    const o = await this.repo.findOpportunity(id);
    if (!o) throw new NotFoundException('Opportunity not found');
    return o;
  }
}
