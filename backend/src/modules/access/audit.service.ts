import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const AuditAction = {
  ACCESS_REQUESTED: 'ACCESS_REQUESTED',
  ACCESS_APPROVED: 'ACCESS_APPROVED',
  ACCESS_REJECTED: 'ACCESS_REJECTED',
  ACCESS_REVOKED: 'ACCESS_REVOKED',
  NDA_SIGNED: 'NDA_SIGNED',
  /** @deprecated No longer written — it fired once per page view, so its
   *  volume tracked traffic rather than activity. Kept so the explorer can
   *  still label rows recorded before it was removed. */
  CONFIDENTIAL_VIEWED: 'CONFIDENTIAL_VIEWED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_DOWNLOADED: 'DOCUMENT_DOWNLOADED',
  /** @deprecated Declared but never written. */
  DOCUMENT_VIEWED: 'DOCUMENT_VIEWED',
  VERIFICATION_UPDATED: 'VERIFICATION_UPDATED',
  OFFER_SUBMITTED: 'OFFER_SUBMITTED',
  OFFER_UPDATED: 'OFFER_UPDATED',
  OFFER_WITHDRAWN: 'OFFER_WITHDRAWN',
  OFFER_STATUS_CHANGED: 'OFFER_STATUS_CHANGED',
  TENDER_CREATED: 'TENDER_CREATED',
  TENDER_UPDATED: 'TENDER_UPDATED',
  TENDER_STAGE_CHANGED: 'TENDER_STAGE_CHANGED',
  BID_CREATED: 'BID_CREATED',
  BID_SUBMITTED: 'BID_SUBMITTED',
  BID_WITHDRAWN: 'BID_WITHDRAWN',
  BID_DISQUALIFIED: 'BID_DISQUALIFIED',
  BIDS_EVALUATED: 'BIDS_EVALUATED',
  BID_AWARDED: 'BID_AWARDED',
  TENDER_FINANCIAL_CLOSE: 'TENDER_FINANCIAL_CLOSE',
  CLARIFICATION_ASKED: 'CLARIFICATION_ASKED',
  CLARIFICATION_ANSWERED: 'CLARIFICATION_ANSWERED',
  ADDENDUM_ISSUED: 'ADDENDUM_ISSUED',
  CHALLENGE_OPENED: 'CHALLENGE_OPENED',
  CHALLENGE_DECIDED: 'CHALLENGE_DECIDED',

  // --- Platform administration ---
  // Recorded so an operator's powers are accountable rather than silent.
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_ACCESS_LEVEL_CHANGED: 'USER_ACCESS_LEVEL_CHANGED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_REINSTATED: 'USER_REINSTATED',
  USER_SIGNED_OUT: 'USER_SIGNED_OUT',
  USER_DELETED: 'USER_DELETED',
  OPPORTUNITY_UNPUBLISHED: 'OPPORTUNITY_UNPUBLISHED',
  OPPORTUNITY_ARCHIVED: 'OPPORTUNITY_ARCHIVED',
  OPPORTUNITY_RESTORED: 'OPPORTUNITY_RESTORED',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/**
 * Append-only audit trail (spec §24, §42). Failures to log must never break the
 * user action, so writes are best-effort and errors are swallowed after logging.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: {
    actorId?: string;
    action: AuditActionType;
    opportunityId?: string;
    targetUserId?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          opportunityId: entry.opportunityId,
          targetUserId: entry.targetUserId,
          metadata: entry.metadata,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log (${entry.action})`, err as Error);
    }
  }

  /**
   * Retention. The trail is evidence, not telemetry, so it is pruned on a
   * schedule rather than capped — a procurement dispute can surface long after
   * the award. Exposed as an admin endpoint so the deployment can cron it
   * without this service taking on a scheduler dependency.
   */
  async pruneOlderThan(days: number): Promise<{ deleted: number; before: Date }> {
    const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: before } },
    });
    this.logger.log(`Pruned ${count} audit rows older than ${days} days`);
    return { deleted: count, before };
  }

  listForOpportunity(opportunityId: string) {
    return this.prisma.auditLog.findMany({
      where: { opportunityId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
