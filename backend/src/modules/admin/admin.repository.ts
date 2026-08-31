import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Cross-domain queries for the back-office.
 *
 * These live here rather than in the domain repositories because they
 * deliberately ignore the visibility rules those repositories enforce — an
 * operator moderating the platform has to see drafts, archived listings and
 * soft-deleted rows that no domain query would ever return.
 */

/** Compact projection for admin tables: enough to triage, not the whole record. */
const OPPORTUNITY_ROW = {
  id: true,
  reference: true,
  title: true,
  sector: true,
  countryCode: true,
  city: true,
  status: true,
  verification: true,
  ownerCategory: true,
  currency: true,
  projectValueCents: true,
  coverImageUrl: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  owner: { select: { id: true, fullName: true, email: true, role: true } },
} satisfies Prisma.OpportunitySelect;

const TENDER_ROW = {
  id: true,
  reference: true,
  title: true,
  stage: true,
  procurementType: true,
  currency: true,
  estimatedValueCents: true,
  submissionDeadline: true,
  publishedAt: true,
  createdAt: true,
  deletedAt: true,
  authority: { select: { id: true, fullName: true, email: true } },
  opportunity: { select: { id: true, reference: true, countryCode: true } },
  _count: { select: { bids: true } },
} satisfies Prisma.TenderSelect;

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------- opportunities

  findOpportunities(where: Prisma.OpportunityWhereInput, skip: number, take: number) {
    return this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where,
        select: OPPORTUNITY_ROW,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.opportunity.count({ where }),
    ]);
  }

  findOpportunity(id: string) {
    return this.prisma.opportunity.findUnique({
      where: { id },
      select: { ...OPPORTUNITY_ROW, summary: true },
    });
  }

  updateOpportunity(id: string, data: Prisma.OpportunityUpdateInput) {
    return this.prisma.opportunity.update({ where: { id }, data, select: OPPORTUNITY_ROW });
  }

  /** Counts by lifecycle status, for the overview. */
  opportunityCounts() {
    return this.prisma.opportunity.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
      orderBy: { status: 'asc' },
    });
  }

  // ------------------------------------------------------------- verification

  /**
   * Listings on the market that a reviewer still has work to do on: never
   * reviewed, still at a self-declared tier, or carrying unresolved items.
   * Ordered so the least-verified surface first.
   */
  verificationQueue(take: number) {
    return this.prisma.opportunity.findMany({
      where: {
        deletedAt: null,
        status: { in: ['PUBLISHED', 'MATCHED', 'IN_DEAL'] },
        OR: [
          { verificationRecord: null },
          { verification: { in: ['T0', 'T1'] } },
          { verificationRecord: { unresolvedItems: { isEmpty: false } } },
        ],
      },
      select: {
        ...OPPORTUNITY_ROW,
        verificationRecord: {
          select: {
            unresolvedItems: true,
            verifiedFields: true,
            reviewedAt: true,
            reviewerName: true,
          },
        },
      },
      orderBy: [{ verification: 'asc' }, { createdAt: 'asc' }],
      take,
    });
  }

  // ------------------------------------------------------------------ tenders

  findTenders(where: Prisma.TenderWhereInput, skip: number, take: number) {
    return this.prisma.$transaction([
      this.prisma.tender.findMany({
        where,
        select: TENDER_ROW,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.tender.count({ where }),
    ]);
  }

  tenderCounts() {
    return this.prisma.tender.groupBy({
      by: ['stage'],
      where: { deletedAt: null },
      _count: true,
      orderBy: { stage: 'asc' },
    });
  }
}
