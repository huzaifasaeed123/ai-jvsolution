import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const AuditAction = {
  ACCESS_REQUESTED: 'ACCESS_REQUESTED',
  ACCESS_APPROVED: 'ACCESS_APPROVED',
  ACCESS_REJECTED: 'ACCESS_REJECTED',
  ACCESS_REVOKED: 'ACCESS_REVOKED',
  NDA_SIGNED: 'NDA_SIGNED',
  CONFIDENTIAL_VIEWED: 'CONFIDENTIAL_VIEWED',
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

  listForOpportunity(opportunityId: string) {
    return this.prisma.auditLog.findMany({
      where: { opportunityId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
