import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferStatus, Prisma } from '@prisma/client';
import { OffersRepository, OfferWithSubmitter } from './offers.repository';
import { serializeOffer } from './offer.serializer';
import { AccessService } from '../access/access.service';
import { AuditService, AuditAction } from '../access/audit.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

function majorToCents(major?: number): bigint | undefined {
  return major === undefined ? undefined : BigInt(Math.round(major * 100));
}

// Statuses the submitter may still edit under.
const EDITABLE: OfferStatus[] = [OfferStatus.SUBMITTED, OfferStatus.UNDER_REVIEW];
// Statuses an owner may set.
const OWNER_SETTABLE: OfferStatus[] = [
  OfferStatus.UNDER_REVIEW,
  OfferStatus.SHORTLISTED,
  OfferStatus.ACCEPTED,
  OfferStatus.REJECTED,
];

@Injectable()
export class OffersService {
  constructor(
    private readonly repo: OffersRepository,
    private readonly access: AccessService,
    private readonly audit: AuditService,
  ) {}

  private async opportunityOr404(id: string) {
    const meta = await this.repo.getOpportunityMeta(id);
    if (!meta) throw new NotFoundException('Opportunity not found');
    return meta;
  }

  private isOwnerOrAdmin(user: AuthUser, ownerId: string) {
    return user.role === 'ADMIN' || user.id === ownerId;
  }

  async submit(user: AuthUser, opportunityId: string, dto: CreateOfferDto) {
    const opp = await this.opportunityOr404(opportunityId);
    if (opp.status !== 'PUBLISHED') throw new BadRequestException('Opportunity is not open for offers');
    if (user.id === opp.ownerId) throw new ForbiddenException('You cannot make an offer on your own opportunity');

    // A serious offer requires an approved + NDA access grant (Area 1 flow).
    const granted = user.role === 'ADMIN' || (await this.access.hasAccess(user.id, opportunityId));
    if (!granted) {
      throw new ForbiddenException('Request and be granted access before submitting an offer');
    }

    const existing = await this.repo.findExisting(opportunityId, user.id);
    if (existing && existing.deletedAt === null) {
      throw new ConflictException('You already have an offer on this opportunity — update it instead');
    }

    const created = await this.repo.create({
      opportunity: { connect: { id: opportunityId } },
      submittedBy: { connect: { id: user.id } },
      ownerId: opp.ownerId,
      type: dto.type,
      structure: dto.structure,
      currency: dto.currency?.toUpperCase() ?? 'USD',
      investmentAmountCents: majorToCents(dto.investmentAmount),
      ownerSharePct: dto.ownerSharePct,
      targetIrr: dto.targetIrr,
      developmentMonths: dto.developmentMonths,
      experienceYears: dto.experienceYears,
      financialCapacityCents: majorToCents(dto.financialCapacity),
      guarantees: dto.guarantees,
      message: dto.message,
    });

    await this.audit.record({
      actorId: user.id,
      action: AuditAction.OFFER_SUBMITTED,
      opportunityId,
      metadata: { offerId: created.id, type: created.type },
    });

    return serializeOffer(created);
  }

  /** Owner/admin see all offers on the opportunity. */
  async listForOpportunity(user: AuthUser, opportunityId: string) {
    const opp = await this.opportunityOr404(opportunityId);
    if (!this.isOwnerOrAdmin(user, opp.ownerId)) {
      throw new ForbiddenException('Only the owner can view offers on this opportunity');
    }
    const items = await this.repo.findForOpportunity(opportunityId);
    return items.map(serializeOffer);
  }

  async listMine(user: AuthUser) {
    const items = await this.repo.findMine(user.id);
    return items.map(serializeOffer);
  }

  async getOne(user: AuthUser, id: string) {
    const offer = await this.mustSee(user, id);
    return serializeOffer(offer);
  }

  async update(user: AuthUser, id: string, dto: UpdateOfferDto) {
    const offer = await this.repo.findById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.submittedById !== user.id) throw new ForbiddenException('Only the submitter can edit this offer');
    if (!EDITABLE.includes(offer.status)) throw new BadRequestException('This offer can no longer be edited');

    const data: Prisma.OfferUpdateInput = {
      type: dto.type,
      structure: dto.structure,
      currency: dto.currency?.toUpperCase(),
      investmentAmountCents: majorToCents(dto.investmentAmount),
      ownerSharePct: dto.ownerSharePct,
      targetIrr: dto.targetIrr,
      developmentMonths: dto.developmentMonths,
      experienceYears: dto.experienceYears,
      financialCapacityCents: majorToCents(dto.financialCapacity),
      guarantees: dto.guarantees,
      message: dto.message,
    };
    const updated = await this.repo.update(id, data);
    await this.audit.record({ actorId: user.id, action: AuditAction.OFFER_UPDATED, opportunityId: offer.opportunityId, metadata: { offerId: id } });
    return serializeOffer(updated);
  }

  async withdraw(user: AuthUser, id: string) {
    const offer = await this.repo.findById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.submittedById !== user.id) throw new ForbiddenException('Only the submitter can withdraw this offer');
    const updated = await this.repo.update(id, { status: OfferStatus.WITHDRAWN });
    await this.audit.record({ actorId: user.id, action: AuditAction.OFFER_WITHDRAWN, opportunityId: offer.opportunityId, metadata: { offerId: id } });
    return serializeOffer(updated);
  }

  /** Owner/admin sets the offer status (review/shortlist/accept/reject). */
  async setStatus(user: AuthUser, id: string, status: OfferStatus) {
    const offer = await this.repo.findById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    if (!this.isOwnerOrAdmin(user, offer.ownerId)) {
      throw new ForbiddenException('Only the owner can change an offer status');
    }
    if (!OWNER_SETTABLE.includes(status)) {
      throw new BadRequestException('Invalid status for an owner to set');
    }
    const updated = await this.repo.update(id, { status });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.OFFER_STATUS_CHANGED,
      opportunityId: offer.opportunityId,
      metadata: { offerId: id, status },
    });
    return serializeOffer(updated);
  }

  private async mustSee(user: AuthUser, id: string): Promise<OfferWithSubmitter> {
    const offer = await this.repo.findById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    const allowed = user.role === 'ADMIN' || offer.submittedById === user.id || offer.ownerId === user.id;
    if (!allowed) throw new ForbiddenException('You do not have access to this offer');
    return offer;
  }
}
