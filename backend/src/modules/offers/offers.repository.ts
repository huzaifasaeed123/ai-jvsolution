import { Injectable } from '@nestjs/common';
import { Prisma, Offer } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type OfferWithSubmitter = Prisma.OfferGetPayload<{
  include: { submittedBy: { select: { id: true; fullName: true; email: true; companyId: true } } };
}>;

const submitterSelect = {
  submittedBy: { select: { id: true, fullName: true, email: true, companyId: true } },
} satisfies Prisma.OfferInclude;

@Injectable()
export class OffersRepository {
  constructor(private readonly prisma: PrismaService) {}

  getOpportunityMeta(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true },
    });
  }

  create(data: Prisma.OfferCreateInput): Promise<OfferWithSubmitter> {
    return this.prisma.offer.create({ data, include: submitterSelect });
  }

  findById(id: string): Promise<OfferWithSubmitter | null> {
    return this.prisma.offer.findFirst({ where: { id, deletedAt: null }, include: submitterSelect });
  }

  findExisting(opportunityId: string, submittedById: string): Promise<Offer | null> {
    return this.prisma.offer.findUnique({
      where: { opportunityId_submittedById: { opportunityId, submittedById } },
    });
  }

  findForOpportunity(opportunityId: string): Promise<OfferWithSubmitter[]> {
    return this.prisma.offer.findMany({
      where: { opportunityId, deletedAt: null },
      include: submitterSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  findMine(submittedById: string): Promise<OfferWithSubmitter[]> {
    return this.prisma.offer.findMany({
      where: { submittedById, deletedAt: null },
      include: submitterSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.OfferUpdateInput): Promise<OfferWithSubmitter> {
    return this.prisma.offer.update({ where: { id }, data, include: submitterSelect });
  }
}
