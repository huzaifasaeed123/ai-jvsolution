import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DueDiligenceItem, Prisma } from '@prisma/client';
import { DueDiligenceRepository } from './duediligence.repository';
import { AccessService } from '../access/access.service';
import { CreateDueDiligenceItemDto } from './dto/create-item.dto';
import { UpdateDueDiligenceItemDto } from './dto/update-item.dto';
import { DD_CATEGORIES } from '../../common/reference/duediligence-categories';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class DueDiligenceService {
  constructor(
    private readonly repo: DueDiligenceRepository,
    private readonly access: AccessService,
  ) {}

  private async opportunityOr404(id: string) {
    const meta = await this.repo.getOpportunityMeta(id);
    if (!meta) throw new NotFoundException('Opportunity not found');
    return meta;
  }

  private isOwnerOrAdmin(user: AuthUser | undefined, ownerId: string) {
    return !!user && (user.role === 'ADMIN' || user.id === ownerId);
  }

  /** DD is confidential: owner/admin, or a user with an approved + NDA-signed grant. */
  private async canView(user: AuthUser | undefined, opportunityId: string, ownerId: string) {
    if (this.isOwnerOrAdmin(user, ownerId)) return true;
    if (!user) return false;
    return this.access.hasAccess(user.id, opportunityId);
  }

  async list(user: AuthUser | undefined, opportunityId: string) {
    const opp = await this.opportunityOr404(opportunityId);
    if (!(await this.canView(user, opportunityId, opp.ownerId))) {
      throw new ForbiddenException('Due diligence is available after access is granted');
    }
    const items = await this.repo.list(opportunityId);
    return { items, summary: summarize(items), canEdit: this.isOwnerOrAdmin(user, opp.ownerId) };
  }

  async create(user: AuthUser, opportunityId: string, dto: CreateDueDiligenceItemDto) {
    const opp = await this.opportunityOr404(opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can add due diligence items');
    }
    return this.repo.create({
      opportunity: { connect: { id: opportunityId } },
      category: dto.category,
      title: dto.title,
      receipt: dto.receipt,
      reviewStatus: dto.reviewStatus,
      riskRating: dto.riskRating,
      finding: dto.finding,
      recommendation: dto.recommendation,
      responsibleParty: dto.responsibleParty,
      mitigation: dto.mitigation,
      evidence: dto.evidence,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      closure: dto.closure,
      createdById: user.id,
    });
  }

  /** Seed a starter checklist — one item per standard category. */
  async seed(user: AuthUser, opportunityId: string) {
    const opp = await this.opportunityOr404(opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can seed due diligence');
    }
    const existing = await this.repo.count(opportunityId);
    if (existing > 0) return { created: 0 };
    const res = await this.repo.createMany(
      DD_CATEGORIES.map((c) => ({
        opportunityId,
        category: c.code,
        title: `${c.label} due diligence`,
        createdById: user.id,
      })),
    );
    return { created: res.count };
  }

  async update(user: AuthUser, itemId: string, dto: UpdateDueDiligenceItemDto) {
    const item = await this.ownedItemOr404(user, itemId);
    const data: Prisma.DueDiligenceItemUpdateInput = {
      ...dto,
      deadline: dto.deadline !== undefined ? (dto.deadline ? new Date(dto.deadline) : null) : undefined,
    };
    return this.repo.update(item.id, data);
  }

  async remove(user: AuthUser, itemId: string) {
    const item = await this.ownedItemOr404(user, itemId);
    await this.repo.softDelete(item.id);
    return { id: item.id, deleted: true };
  }

  private async ownedItemOr404(user: AuthUser, itemId: string): Promise<DueDiligenceItem> {
    const item = await this.repo.findById(itemId);
    if (!item) throw new NotFoundException('Item not found');
    const opp = await this.opportunityOr404(item.opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can modify due diligence items');
    }
    return item;
  }
}

/** Roll-up counts by risk and closure for the dashboard header. */
function summarize(items: DueDiligenceItem[]) {
  const byRisk: Record<string, number> = {};
  let open = 0;
  let closed = 0;
  for (const i of items) {
    if (i.riskRating) byRisk[i.riskRating] = (byRisk[i.riskRating] ?? 0) + 1;
    if (i.closure === 'CLOSED') closed++;
    else open++;
  }
  return { total: items.length, open, closed, byRisk };
}
