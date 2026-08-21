import { Injectable } from '@nestjs/common';
import { Prisma, Opportunity } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** Opportunity relation with the owner included (for full/owner serialization). */
export type OpportunityWithOwner = Prisma.OpportunityGetPayload<{
  include: { owner: { select: { id: true; fullName: true; email: true; companyId: true } } };
}>;

const ownerSelect = {
  owner: { select: { id: true, fullName: true, email: true, companyId: true } },
} satisfies Prisma.OpportunityInclude;

/** All Prisma access for the opportunities domain lives here. */
@Injectable()
export class OpportunitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.OpportunityCreateInput): Promise<OpportunityWithOwner> {
    return this.prisma.opportunity.create({ data, include: ownerSelect });
  }

  findById(id: string): Promise<OpportunityWithOwner | null> {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      include: ownerSelect,
    });
  }

  async findManyPublic(
    where: Prisma.OpportunityWhereInput,
    skip: number,
    take: number,
  ): Promise<{ items: OpportunityWithOwner[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where,
        include: ownerSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.opportunity.count({ where }),
    ]);
    return { items, total };
  }

  findManyByOwner(ownerId: string): Promise<OpportunityWithOwner[]> {
    return this.prisma.opportunity.findMany({
      where: { ownerId, deletedAt: null },
      include: ownerSelect,
      orderBy: { updatedAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.OpportunityUpdateInput): Promise<OpportunityWithOwner> {
    return this.prisma.opportunity.update({ where: { id }, data, include: ownerSelect });
  }

  softDelete(id: string): Promise<Opportunity> {
    return this.prisma.opportunity.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  countAll(): Promise<number> {
    return this.prisma.opportunity.count();
  }
}
