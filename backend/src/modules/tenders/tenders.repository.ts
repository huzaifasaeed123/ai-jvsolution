import { Injectable } from '@nestjs/common';
import { Prisma, Tender } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const detailInclude = {
  authority: { select: { id: true, fullName: true, email: true } },
  opportunity: { select: { id: true, reference: true, title: true, countryCode: true, sector: true } },
} satisfies Prisma.TenderInclude;

export type TenderDetail = Prisma.TenderGetPayload<{ include: typeof detailInclude }>;

@Injectable()
export class TendersRepository {
  constructor(private readonly prisma: PrismaService) {}

  getOpportunityMeta(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true, ownerCategory: true, countryCode: true },
    });
  }

  create(data: Prisma.TenderCreateInput): Promise<TenderDetail> {
    return this.prisma.tender.create({ data, include: detailInclude });
  }

  findById(id: string): Promise<TenderDetail | null> {
    return this.prisma.tender.findFirst({ where: { id, deletedAt: null }, include: detailInclude });
  }

  /** Public tender notices — anything past DRAFT and not cancelled. */
  findPublic(where: Prisma.TenderWhereInput = {}): Promise<TenderDetail[]> {
    return this.prisma.tender.findMany({
      where: {
        ...where,
        deletedAt: null,
        stage: { notIn: ['DRAFT', 'CANCELLED'] },
      },
      include: detailInclude,
      orderBy: [{ submissionDeadline: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    });
  }

  findByAuthority(authorityId: string): Promise<TenderDetail[]> {
    return this.prisma.tender.findMany({
      where: { authorityId, deletedAt: null },
      include: detailInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findForOpportunity(opportunityId: string): Promise<TenderDetail[]> {
    return this.prisma.tender.findMany({
      where: { opportunityId, deletedAt: null },
      include: detailInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.TenderUpdateInput): Promise<TenderDetail> {
    return this.prisma.tender.update({ where: { id }, data, include: detailInclude });
  }

  softDelete(id: string): Promise<Tender> {
    return this.prisma.tender.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
