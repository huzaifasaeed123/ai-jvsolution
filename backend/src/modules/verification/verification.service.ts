import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { AuditService, AuditAction } from '../access/audit.service';
import { SetVerificationDto } from './dto/set-verification.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class VerificationService {
  constructor(
    private readonly repo: VerificationRepository,
    private readonly opportunities: OpportunitiesService,
    private readonly audit: AuditService,
  ) {}

  /** Public-facing passport: tier + verified fields + unresolved items + date.
   * Reviewer identity and notes are only exposed to the owner/admin. */
  async get(opportunityId: string, user?: AuthUser) {
    const opp = await this.repo.getOpportunity(opportunityId);
    if (!opp) throw new NotFoundException('Opportunity not found');

    const privileged = !!user && (user.role === 'ADMIN' || user.id === opp.ownerId);
    if (opp.status !== 'PUBLISHED' && !privileged) {
      throw new NotFoundException('Opportunity not found');
    }

    const record = await this.repo.findByOpportunity(opportunityId);
    return {
      tier: opp.verification,
      verifiedFields: record?.verifiedFields ?? [],
      unresolvedItems: record?.unresolvedItems ?? [],
      reviewedAt: record?.reviewedAt ?? null,
      canVerify: !!user && user.role === 'ADMIN',
      // owner/admin-only detail
      ...(privileged
        ? { reviewer: record?.reviewerName ?? null, notes: record?.notes ?? null }
        : {}),
    };
  }

  /** Admin sets the tier + verified fields + unresolved items + notes. */
  async set(user: AuthUser, opportunityId: string, dto: SetVerificationDto) {
    const opp = await this.repo.getOpportunity(opportunityId);
    if (!opp) throw new NotFoundException('Opportunity not found');

    // Advance the tier on the opportunity itself.
    await this.opportunities.setVerification(opportunityId, dto.tier);

    const record = await this.repo.upsert(opportunityId, {
      verifiedFields: dto.verifiedFields ?? [],
      unresolvedItems: dto.unresolvedItems ?? [],
      notes: dto.notes,
      reviewerId: user.id,
      reviewerName: user.email,
      reviewedAt: new Date(),
    });

    await this.audit.record({
      actorId: user.id,
      action: AuditAction.VERIFICATION_UPDATED,
      opportunityId,
      metadata: { tier: dto.tier, verifiedFields: record.verifiedFields },
    });

    return this.get(opportunityId, user);
  }
}
