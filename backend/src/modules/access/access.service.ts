import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccessStatus } from '@prisma/client';
import { AccessRepository, AccessRequestWithRelations } from './access.repository';
import { AuditService, AuditAction } from './audit.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

function serialize(r: AccessRequestWithRelations) {
  return {
    id: r.id,
    opportunityId: r.opportunityId,
    opportunity: r.opportunity,
    requesterId: r.requesterId,
    requester: r.requester,
    ownerId: r.ownerId,
    status: r.status,
    message: r.message,
    ndaSignedAt: r.ndaSignedAt,
    decidedAt: r.decidedAt,
    createdAt: r.createdAt,
    // convenience flag: confidential is revealed only when approved + NDA signed
    accessGranted: r.status === AccessStatus.APPROVED && r.ndaSignedAt !== null,
  };
}

@Injectable()
export class AccessService {
  constructor(
    private readonly repo: AccessRepository,
    private readonly audit: AuditService,
  ) {}

  async request(user: AuthUser, dto: CreateAccessRequestDto) {
    const meta = await this.repo.getOpportunityMeta(dto.opportunityId);
    if (!meta) throw new NotFoundException('Opportunity not found');
    if (meta.status !== 'PUBLISHED') {
      throw new BadRequestException('Access can only be requested on published opportunities');
    }
    if (meta.ownerId === user.id) {
      throw new BadRequestException('You already own this opportunity');
    }

    const existing = await this.repo.findByOpportunityAndRequester(dto.opportunityId, user.id);
    if (existing) {
      if (existing.status === AccessStatus.PENDING || existing.status === AccessStatus.APPROVED) {
        throw new ConflictException('You already have an active request for this opportunity');
      }
      // Re-request after rejection/revocation: reset to pending.
      const reset = await this.repo.update(existing.id, {
        status: AccessStatus.PENDING,
        message: dto.message,
        ndaSignedAt: null,
        decidedAt: null,
        decidedById: null,
      });
      await this.audit.record({
        actorId: user.id,
        action: AuditAction.ACCESS_REQUESTED,
        opportunityId: dto.opportunityId,
      });
      return serialize(reset);
    }

    const created = await this.repo.create({
      opportunity: { connect: { id: dto.opportunityId } },
      requester: { connect: { id: user.id } },
      ownerId: meta.ownerId,
      message: dto.message,
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.ACCESS_REQUESTED,
      opportunityId: dto.opportunityId,
    });
    return serialize(created);
  }

  async listIncoming(user: AuthUser) {
    const rows = await this.repo.findIncoming(user.id);
    return rows.map(serialize);
  }

  async listMine(user: AuthUser) {
    const rows = await this.repo.findMine(user.id);
    return rows.map(serialize);
  }

  /** The current user's request for one opportunity (null if none) — powers the detail panel. */
  async forOpportunity(user: AuthUser, opportunityId: string) {
    const row = await this.repo.findByOpportunityAndRequester(opportunityId, user.id);
    return row ? serialize(row) : null;
  }

  async decide(user: AuthUser, id: string, approve: boolean) {
    const req = await this.repo.findById(id);
    if (!req) throw new NotFoundException('Access request not found');
    if (user.role !== 'ADMIN' && req.ownerId !== user.id) {
      throw new ForbiddenException('You cannot decide this request');
    }
    if (req.status !== AccessStatus.PENDING) {
      throw new BadRequestException('This request has already been decided');
    }
    const updated = await this.repo.update(id, {
      status: approve ? AccessStatus.APPROVED : AccessStatus.REJECTED,
      decidedAt: new Date(),
      decidedById: user.id,
    });
    await this.audit.record({
      actorId: user.id,
      action: approve ? AuditAction.ACCESS_APPROVED : AuditAction.ACCESS_REJECTED,
      opportunityId: req.opportunityId,
      targetUserId: req.requesterId,
    });
    return serialize(updated);
  }

  async signNda(user: AuthUser, id: string) {
    const req = await this.repo.findById(id);
    if (!req) throw new NotFoundException('Access request not found');
    if (req.requesterId !== user.id) {
      throw new ForbiddenException('Only the requester can sign the NDA');
    }
    if (req.status !== AccessStatus.APPROVED) {
      throw new BadRequestException('The owner must approve your request before you can sign the NDA');
    }
    if (req.ndaSignedAt) return serialize(req);

    const updated = await this.repo.update(id, { ndaSignedAt: new Date() });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.NDA_SIGNED,
      opportunityId: req.opportunityId,
    });
    return serialize(updated);
  }

  async revoke(user: AuthUser, id: string) {
    const req = await this.repo.findById(id);
    if (!req) throw new NotFoundException('Access request not found');
    if (user.role !== 'ADMIN' && req.ownerId !== user.id) {
      throw new ForbiddenException('You cannot revoke this request');
    }
    const updated = await this.repo.update(id, { status: AccessStatus.REVOKED });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.ACCESS_REVOKED,
      opportunityId: req.opportunityId,
      targetUserId: req.requesterId,
    });
    return serialize(updated);
  }

  /** Used by OpportunitiesService to decide confidential reveal. */
  hasAccess(userId: string, opportunityId: string): Promise<boolean> {
    return this.repo.hasGrant(opportunityId, userId);
  }
}
