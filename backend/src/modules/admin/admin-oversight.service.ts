import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../access/audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';

/**
 * Platform oversight: the activity record, growth figures, and the access
 * requests an operator may be asked to arbitrate.
 *
 * Everything here is read-only apart from retention pruning. An operator
 * investigating a dispute should not be able to alter the thing they are
 * investigating.
 */
@Injectable()
export class AdminOversightService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // -------------------------------------------------------- audit explorer

  async auditTrail(query: QueryAuditDto) {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = query.actorId;
    if (query.targetUserId) where.targetUserId = query.targetUserId;
    if (query.opportunityId) where.opportunityId = query.opportunityId;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      // `to` is inclusive of the whole day, which is what a date picker implies.
      if (query.to) {
        const end = new Date(query.to);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    // The log stores ids, not names. Resolving them in one pass keeps the
    // explorer readable without denormalising the trail itself, which has to
    // stay append-only and cheap to write.
    const userIds = [
      ...new Set(rows.flatMap((r) => [r.actorId, r.targetUserId]).filter(Boolean) as string[]),
    ];
    const oppIds = [...new Set(rows.map((r) => r.opportunityId).filter(Boolean) as string[])];

    const [users, opportunities] = await Promise.all([
      userIds.length
        ? this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true, email: true, role: true },
          })
        : Promise.resolve([]),
      oppIds.length
        ? this.prisma.opportunity.findMany({
            where: { id: { in: oppIds } },
            select: { id: true, reference: true, title: true },
          })
        : Promise.resolve([]),
    ]);

    const userById = new Map(users.map((u) => [u.id, u] as const));
    const oppById = new Map(opportunities.map((o) => [o.id, o] as const));

    return {
      items: rows.map((r) => ({
        id: r.id,
        action: r.action,
        createdAt: r.createdAt,
        metadata: r.metadata,
        actor: r.actorId ? (userById.get(r.actorId) ?? { id: r.actorId }) : null,
        targetUser: r.targetUserId
          ? (userById.get(r.targetUserId) ?? { id: r.targetUserId })
          : null,
        opportunity: r.opportunityId
          ? (oppById.get(r.opportunityId) ?? { id: r.opportunityId })
          : null,
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** Distinct actions present in the trail, to populate the filter. */
  async auditActions() {
    const rows = await this.prisma.auditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: { action: 'asc' },
    });
    return rows.map((r) => ({ action: r.action, count: r._count }));
  }

  pruneAudit(days: number) {
    return this.audit.pruneOlderThan(days);
  }

  // ------------------------------------------------------------- metrics

  /**
   * Growth by month. Grouped in SQL rather than in memory — the trail and the
   * listing table both outgrow a fetch-everything-and-count approach quickly.
   */
  async growth(months = 12) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const series = async (table: 'User' | 'Opportunity' | 'Tender' | 'Bid' | 'Offer') =>
      this.prisma.$queryRaw<{ month: Date; count: bigint }[]>`
        SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::bigint AS count
        FROM ${Prisma.raw(`"${table}"`)}
        WHERE "createdAt" >= ${since}
        GROUP BY 1 ORDER BY 1
      `;

    const [users, opportunities, tenders, bids, offers] = await Promise.all([
      series('User'),
      series('Opportunity'),
      series('Tender'),
      series('Bid'),
      series('Offer'),
    ]);

    const norm = (rows: { month: Date; count: bigint }[]) =>
      rows.map((r) => ({ month: r.month.toISOString().slice(0, 7), count: Number(r.count) }));

    return {
      since: since.toISOString().slice(0, 10),
      users: norm(users),
      opportunities: norm(opportunities),
      tenders: norm(tenders),
      bids: norm(bids),
      offers: norm(offers),
    };
  }

  /** Engine usage — how much the analysis tools are actually being used. */
  async engineRuns() {
    const [feasibility, valuation, estimate] = await this.prisma.$transaction([
      this.prisma.feasibilityRun.count(),
      this.prisma.valuationRun.count(),
      this.prisma.estimateRun.count(),
    ]);
    return { feasibility, valuation, estimate, total: feasibility + valuation + estimate };
  }

  // ----------------------------------------------------- access oversight

  /**
   * Access requests across the platform, newest first. An operator lands here
   * when an owner and a requester disagree about what was granted and when.
   */
  async accessRequests(status?: string, page = 1, limit = 25) {
    const where: Prisma.AccessRequestWhereInput = {};
    if (status) where.status = status as Prisma.AccessRequestWhereInput['status'];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.accessRequest.findMany({
        where,
        include: {
          requester: { select: { id: true, fullName: true, email: true, role: true } },
          opportunity: { select: { id: true, reference: true, title: true, ownerId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.accessRequest.count({ where }),
    ]);

    const now = Date.now();
    return {
      items: items.map((r) => ({
        ...r,
        // A request nobody has answered is the thing an operator chases.
        pendingDays:
          r.status === 'PENDING'
            ? Math.floor((now - r.createdAt.getTime()) / 86_400_000)
            : null,
        accessGranted: r.status === 'APPROVED' && r.ndaSignedAt !== null,
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async accessRequestCounts() {
    const rows = await this.prisma.accessRequest.groupBy({
      by: ['status'],
      _count: true,
      orderBy: { status: 'asc' },
    });
    return rows.map((r) => ({ status: r.status, count: r._count }));
  }
}
