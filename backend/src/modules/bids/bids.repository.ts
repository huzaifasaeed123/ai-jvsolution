import { Injectable } from '@nestjs/common';
import { Prisma, Bid } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const detailInclude = {
  bidder: { select: { id: true, fullName: true, email: true, companyId: true } },
  consortium: { select: { id: true, name: true } },
  tender: {
    select: {
      id: true,
      reference: true,
      title: true,
      stage: true,
      authorityId: true,
      submissionDeadline: true,
      currency: true,
      evaluationCriteria: true,
    },
  },
} satisfies Prisma.BidInclude;

export type BidDetail = Prisma.BidGetPayload<{ include: typeof detailInclude }>;

@Injectable()
export class BidsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getTender(id: string) {
    return this.prisma.tender.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        authorityId: true,
        stage: true,
        submissionDeadline: true,
        opportunityId: true,
        currency: true,
      },
    });
  }

  getConsortium(id: string) {
    return this.prisma.consortium.findUnique({
      where: { id },
      select: { id: true, leadId: true, status: true },
    });
  }

  create(data: Prisma.BidCreateInput): Promise<BidDetail> {
    return this.prisma.bid.create({ data, include: detailInclude });
  }

  findById(id: string): Promise<BidDetail | null> {
    return this.prisma.bid.findFirst({ where: { id, deletedAt: null }, include: detailInclude });
  }

  findExisting(tenderId: string, bidderId: string): Promise<Bid | null> {
    return this.prisma.bid.findUnique({ where: { tenderId_bidderId: { tenderId, bidderId } } });
  }

  findForTender(tenderId: string): Promise<BidDetail[]> {
    return this.prisma.bid.findMany({
      where: { tenderId, deletedAt: null },
      include: detailInclude,
      orderBy: { submittedAt: 'asc' },
    });
  }

  findMine(bidderId: string): Promise<BidDetail[]> {
    return this.prisma.bid.findMany({
      where: { bidderId, deletedAt: null },
      include: detailInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  countSubmitted(tenderId: string): Promise<number> {
    return this.prisma.bid.count({
      where: { tenderId, deletedAt: null, status: { in: ['SUBMITTED', 'EVALUATED', 'PREFERRED', 'UNSUCCESSFUL'] } },
    });
  }

  update(id: string, data: Prisma.BidUpdateInput): Promise<BidDetail> {
    return this.prisma.bid.update({ where: { id }, data, include: detailInclude });
  }
}
