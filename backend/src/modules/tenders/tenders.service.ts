import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TenderStage } from '@prisma/client';
import { randomBytes } from 'crypto';
import { TendersRepository, TenderDetail } from './tenders.repository';
import { serializeTender } from './tender.serializer';
import { AuditService, AuditAction } from '../access/audit.service';
import { CreateTenderDto, UpdateTenderDto } from './dto/tender.dto';
import { DEFAULT_EVALUATION_CRITERIA } from '../../common/reference/procurement-reference';
import { AuthUser } from '../../common/decorators/current-user.decorator';

function majorToCents(major?: number): bigint | undefined {
  return major === undefined ? undefined : BigInt(Math.round(major * 100));
}

/**
 * Legal stage transitions (spec §13). A tender moves forward through the
 * procurement lifecycle; it cannot jump backwards, which keeps the process
 * defensible. Cancellation is allowed from any live stage.
 */
const ALLOWED_TRANSITIONS: Record<TenderStage, TenderStage[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['CLARIFICATION', 'SUBMISSION_CLOSED', 'CANCELLED'],
  CLARIFICATION: ['SUBMISSION_CLOSED', 'CANCELLED'],
  SUBMISSION_CLOSED: ['UNDER_EVALUATION', 'CANCELLED'],
  UNDER_EVALUATION: ['PREFERRED_BIDDER', 'CANCELLED'],
  PREFERRED_BIDDER: ['FINANCIAL_CLOSE', 'CANCELLED'],
  FINANCIAL_CLOSE: [],
  CANCELLED: [],
};

@Injectable()
export class TendersService {
  constructor(
    private readonly repo: TendersRepository,
    private readonly audit: AuditService,
  ) {}

  private isAuthorityOrAdmin(user: AuthUser, authorityId: string) {
    return user.role === 'ADMIN' || user.id === authorityId;
  }

  async create(user: AuthUser, opportunityId: string, dto: CreateTenderDto) {
    const opp = await this.repo.getOpportunityMeta(opportunityId);
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (user.role !== 'ADMIN' && opp.ownerId !== user.id) {
      throw new ForbiddenException('Only the opportunity owner can publish a tender');
    }
    // Tenders are a public-sector instrument (spec §13).
    if (opp.ownerCategory === 'PRIVATE') {
      throw new BadRequestException(
        'Tenders apply to government or semi-government opportunities. Use offers for private deals.',
      );
    }

    const data: Prisma.TenderCreateInput = {
      reference: `TND-${opp.countryCode.toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`,
      title: dto.title,
      procurementType: dto.procurementType,
      opportunity: { connect: { id: opportunityId } },
      authority: { connect: { id: user.id } },
      employerRequirements: dto.employerRequirements,
      outputSpecification: dto.outputSpecification,
      siteInformation: dto.siteInformation,
      governmentSupport: dto.governmentSupport,
      paymentMechanism: dto.paymentMechanism,
      riskAllocation: (dto.riskAllocation ?? []) as unknown as Prisma.InputJsonValue,
      // Publish criteria up front — default to the standard set if none supplied.
      evaluationCriteria: (dto.evaluationCriteria ??
        DEFAULT_EVALUATION_CRITERIA) as unknown as Prisma.InputJsonValue,
      currency: dto.currency?.toUpperCase() ?? 'USD',
      estimatedValueCents: majorToCents(dto.estimatedValue),
      bidSecurityCents: majorToCents(dto.bidSecurity),
      concessionYears: dto.concessionYears,
      clarificationDeadline: dto.clarificationDeadline ? new Date(dto.clarificationDeadline) : null,
      submissionDeadline: dto.submissionDeadline ? new Date(dto.submissionDeadline) : null,
    };

    const created = await this.repo.create(data);
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.TENDER_CREATED,
      opportunityId,
      metadata: { tenderId: created.id, reference: created.reference },
    });
    return serializeTender(created, user.id);
  }

  /** Public tender notices — visible to everyone (transparency, spec §13). */
  async listPublic(filter: { countryCode?: string; stage?: TenderStage }) {
    const where: Prisma.TenderWhereInput = {
      ...(filter.stage ? { stage: filter.stage } : {}),
      ...(filter.countryCode
        ? { opportunity: { countryCode: filter.countryCode.toUpperCase() } }
        : {}),
    };
    const items = await this.repo.findPublic(where);
    return items.map((t) => serializeTender(t));
  }

  async listMine(user: AuthUser) {
    const items = await this.repo.findByAuthority(user.id);
    return items.map((t) => serializeTender(t, user.id));
  }

  async listForOpportunity(opportunityId: string, user?: AuthUser) {
    const items = await this.repo.findForOpportunity(opportunityId);
    const visible = items.filter(
      (t) => t.stage !== 'DRAFT' || (user && this.isAuthorityOrAdmin(user, t.authorityId)),
    );
    return visible.map((t) => serializeTender(t, user?.id));
  }

  async getOne(id: string, user?: AuthUser) {
    const t = await this.repo.findById(id);
    if (!t) throw new NotFoundException('Tender not found');
    // Drafts are private to the authority until published.
    if (t.stage === 'DRAFT' && !(user && this.isAuthorityOrAdmin(user, t.authorityId))) {
      throw new NotFoundException('Tender not found');
    }
    return serializeTender(t, user?.id);
  }

  async update(user: AuthUser, id: string, dto: UpdateTenderDto) {
    const t = await this.mustAuthority(user, id);
    // Once bidding is closed the terms are fixed — changing them mid-evaluation
    // would undermine the process.
    if (!['DRAFT', 'PUBLISHED', 'CLARIFICATION'].includes(t.stage)) {
      throw new BadRequestException('The tender can no longer be amended at this stage');
    }
    const data: Prisma.TenderUpdateInput = {
      title: dto.title,
      procurementType: dto.procurementType,
      employerRequirements: dto.employerRequirements,
      outputSpecification: dto.outputSpecification,
      siteInformation: dto.siteInformation,
      governmentSupport: dto.governmentSupport,
      paymentMechanism: dto.paymentMechanism,
      currency: dto.currency?.toUpperCase(),
      estimatedValueCents: majorToCents(dto.estimatedValue),
      bidSecurityCents: majorToCents(dto.bidSecurity),
      concessionYears: dto.concessionYears,
      ...(dto.riskAllocation
        ? { riskAllocation: dto.riskAllocation as unknown as Prisma.InputJsonValue }
        : {}),
      ...(dto.evaluationCriteria
        ? { evaluationCriteria: dto.evaluationCriteria as unknown as Prisma.InputJsonValue }
        : {}),
      ...(dto.clarificationDeadline !== undefined
        ? { clarificationDeadline: dto.clarificationDeadline ? new Date(dto.clarificationDeadline) : null }
        : {}),
      ...(dto.submissionDeadline !== undefined
        ? { submissionDeadline: dto.submissionDeadline ? new Date(dto.submissionDeadline) : null }
        : {}),
    };
    const updated = await this.repo.update(id, data);
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.TENDER_UPDATED,
      opportunityId: t.opportunityId,
      metadata: { tenderId: id },
    });
    return serializeTender(updated, user.id);
  }

  async setStage(user: AuthUser, id: string, stage: TenderStage) {
    const t = await this.mustAuthority(user, id);
    const allowed = ALLOWED_TRANSITIONS[t.stage];
    if (!allowed.includes(stage)) {
      throw new BadRequestException(
        `Cannot move a tender from ${t.stage} to ${stage}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }
    // Publishing requires the terms bidders need in order to bid.
    if (stage === 'PUBLISHED') {
      if (!t.submissionDeadline) {
        throw new BadRequestException('Set a submission deadline before publishing');
      }
      if (t.submissionDeadline.getTime() <= Date.now()) {
        throw new BadRequestException('The submission deadline must be in the future');
      }
    }

    const updated = await this.repo.update(id, {
      stage,
      ...(stage === 'PUBLISHED' && !t.publishedAt ? { publishedAt: new Date() } : {}),
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.TENDER_STAGE_CHANGED,
      opportunityId: t.opportunityId,
      metadata: { tenderId: id, from: t.stage, to: stage },
    });
    return serializeTender(updated, user.id);
  }

  async remove(user: AuthUser, id: string) {
    const t = await this.mustAuthority(user, id);
    if (t.stage !== 'DRAFT') {
      throw new BadRequestException('Only a draft tender can be deleted — cancel it instead');
    }
    await this.repo.softDelete(id);
    return { id, deleted: true };
  }

  private async mustAuthority(user: AuthUser, id: string): Promise<TenderDetail> {
    const t = await this.repo.findById(id);
    if (!t) throw new NotFoundException('Tender not found');
    if (!this.isAuthorityOrAdmin(user, t.authorityId)) {
      throw new ForbiddenException('Only the publishing authority can do this');
    }
    return t;
  }
}
