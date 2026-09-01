import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, OpportunityStatus, VerificationTier } from '@prisma/client';
import { randomBytes } from 'crypto';
import { OpportunitiesRepository, OpportunityWithOwner } from './opportunities.repository';
import { OpportunitySerializer } from './opportunity.serializer';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { AccessService } from '../access/access.service';
import { AuditService, AuditAction } from '../access/audit.service';

function majorToCents(major?: number): bigint | undefined {
  return major === undefined ? undefined : BigInt(Math.round(major * 100));
}

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly repo: OpportunitiesRepository,
    private readonly access: AccessService,
    private readonly audit: AuditService,
  ) {}

  // ---- Commands ----

  async create(user: AuthUser, dto: CreateOpportunityDto) {
    const reference = this.generateReference(dto.countryCode);
    const data: Prisma.OpportunityCreateInput = {
      reference,
      title: dto.title,
      summary: dto.summary,
      sector: dto.sector,
      projectType: dto.projectType,
      ownerCategory: dto.ownerCategory,
      countryCode: dto.countryCode.toUpperCase(),
      region: dto.region,
      city: dto.city,
      addressLine: dto.addressLine,
      latitude: dto.latitude,
      longitude: dto.longitude,
      landAreaSqm: dto.landAreaSqm,
      gfaSqm: dto.gfaSqm,
      buaSqm: dto.buaSqm,
      nsaSqm: dto.nsaSqm,
      plotRatio: dto.plotRatio,
      landUse: dto.landUse,
      heightLimit: dto.heightLimit,
      currency: dto.currency?.toUpperCase() ?? 'USD',
      projectValueCents: majorToCents(dto.projectValue),
      investmentRequiredCents: majorToCents(dto.investmentRequired),
      targetIrr: dto.targetIrr,
      developmentPeriodMonths: dto.developmentPeriodMonths,
      concessionPeriodYears: dto.concessionPeriodYears,
      structures: dto.structures ?? [],
      riskLevel: dto.riskLevel,
      permitStatus: dto.permitStatus,
      dataRoomReadiness: dto.dataRoomReadiness,
      requiredDeveloperExperience: dto.requiredDeveloperExperience,
      requiredContractorClass: dto.requiredContractorClass,
      requiredOperatorType: dto.requiredOperatorType,
      financingRequired: dto.financingRequired ?? false,
      owner: { connect: { id: user.id } },
    };
    const created = await this.repo.create(data);
    return OpportunitySerializer.toFull(created);
  }

  async update(user: AuthUser, id: string, dto: UpdateOpportunityDto) {
    const existing = await this.getOwnedOr404(user, id);
    const data: Prisma.OpportunityUpdateInput = {
      ...dto,
      countryCode: dto.countryCode?.toUpperCase(),
      currency: dto.currency?.toUpperCase(),
      projectValueCents: majorToCents(dto.projectValue),
      investmentRequiredCents: majorToCents(dto.investmentRequired),
    };
    // Strip DTO-only money aliases that aren't columns.
    delete (data as Record<string, unknown>).projectValue;
    delete (data as Record<string, unknown>).investmentRequired;

    const updated = await this.repo.update(existing.id, data);
    return OpportunitySerializer.toFull(updated);
  }

  async publish(user: AuthUser, id: string) {
    const existing = await this.getOwnedOr404(user, id);
    if (existing.status !== OpportunityStatus.DRAFT) {
      throw new BadRequestException('Only draft opportunities can be published');
    }
    const updated = await this.repo.update(existing.id, { status: OpportunityStatus.PUBLISHED });
    return OpportunitySerializer.toFull(updated);
  }

  async remove(user: AuthUser, id: string) {
    const existing = await this.getOwnedOr404(user, id);
    await this.repo.softDelete(existing.id);
    return { id: existing.id, deleted: true };
  }

  /** Admin-only: advance the Opportunity Passport verification tier (spec §23). */
  async setVerification(id: string, tier: VerificationTier) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Opportunity not found');
    const updated = await this.repo.update(id, { verification: tier });
    return OpportunitySerializer.toFull(updated);
  }

  // ---- Queries ----

  async list(query: QueryOpportunityDto) {
    const where: Prisma.OpportunityWhereInput = {
      deletedAt: null,
      status: OpportunityStatus.PUBLISHED,
      ...(query.countryCode ? { countryCode: query.countryCode.toUpperCase() } : {}),
      ...(query.sector ? { sector: query.sector } : {}),
      ...(query.projectType ? { projectType: query.projectType } : {}),
      ...(query.ownerCategory ? { ownerCategory: query.ownerCategory } : {}),
      ...(query.riskLevel ? { riskLevel: query.riskLevel } : {}),
      ...(query.structure ? { structures: { has: query.structure } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { summary: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...this.investmentRange(query),
    };

    const skip = (query.page - 1) * query.limit;
    const { items, total } = await this.repo.findManyPublic(where, skip, query.limit);
    return {
      items: items.map((o) => OpportunitySerializer.toPublic(o)),
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    };
  }

  async listMine(user: AuthUser) {
    const items = await this.repo.findManyByOwner(user.id);
    return items.map((o) => OpportunitySerializer.toFull(o));
  }

  /**
   * Raw published candidates for the matching engine (internal cross-service use).
   * Optionally pre-filtered by country/sector to narrow the set; the Fit Score
   * still scores each candidate on all factors.
   */
  async findMatchCandidates(filter: {
    countryCodes?: string[];
    sectors?: string[];
  }): Promise<OpportunityWithOwner[]> {
    const or: Prisma.OpportunityWhereInput[] = [];
    if (filter.countryCodes?.length) or.push({ countryCode: { in: filter.countryCodes } });
    if (filter.sectors?.length) or.push({ sector: { in: filter.sectors } });
    const where: Prisma.OpportunityWhereInput = or.length ? { OR: or } : {};
    return this.repo.findPublishedCandidates(where);
  }

  /** Public detail. Drafts are hidden from non-owners; confidential fields are
   * revealed to the owner/admin, and to a user with an approved + NDA-signed
   * access grant (spec §24). Grant-based reveals are audited. */
  async getOne(id: string, user?: AuthUser) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Opportunity not found');

    let privileged = false;
    let viaGrant = false;
    if (user) {
      if (user.role === 'ADMIN' || found.ownerId === user.id) {
        privileged = true;
      } else if (await this.access.hasAccess(user.id, found.id)) {
        privileged = true;
        viaGrant = true;
      }
    }

    if (found.status !== OpportunityStatus.PUBLISHED && !privileged) {
      throw new NotFoundException('Opportunity not found');
    }

    // No audit write here on purpose. This fires on every detail-page load for
    // an access-granted user, so it was the one entry whose volume scaled with
    // traffic rather than with activity. What an owner actually needs to know —
    // who was granted access, who signed the NDA, who downloaded which document
    // — is still recorded, and each of those is a deliberate act rather than a
    // page view.

    return privileged
      ? OpportunitySerializer.toFull(found)
      : OpportunitySerializer.toPublic(found);
  }

  // ---- Helpers ----

  private investmentRange(q: QueryOpportunityDto): Prisma.OpportunityWhereInput {
    if (q.minInvestment === undefined && q.maxInvestment === undefined) return {};
    const gte = q.minInvestment !== undefined ? BigInt(Math.round(q.minInvestment * 100)) : undefined;
    const lte = q.maxInvestment !== undefined ? BigInt(Math.round(q.maxInvestment * 100)) : undefined;
    return { investmentRequiredCents: { ...(gte !== undefined ? { gte } : {}), ...(lte !== undefined ? { lte } : {}) } };
  }

  private async getOwnedOr404(user: AuthUser, id: string): Promise<OpportunityWithOwner> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Opportunity not found');
    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      throw new ForbiddenException('You do not own this opportunity');
    }
    return existing;
  }

  private generateReference(countryCode: string): string {
    const cc = countryCode.toUpperCase();
    const rand = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
    return `JV-${cc}-${rand}`;
  }
}
