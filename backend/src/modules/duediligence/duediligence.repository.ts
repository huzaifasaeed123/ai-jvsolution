import { Injectable } from '@nestjs/common';
import { Prisma, DueDiligenceItem } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DueDiligenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  getOpportunityMeta(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true },
    });
  }

  list(opportunityId: string): Promise<DueDiligenceItem[]> {
    return this.prisma.dueDiligenceItem.findMany({
      where: { opportunityId, deletedAt: null },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });
  }

  count(opportunityId: string): Promise<number> {
    return this.prisma.dueDiligenceItem.count({ where: { opportunityId, deletedAt: null } });
  }

  findById(id: string): Promise<DueDiligenceItem | null> {
    return this.prisma.dueDiligenceItem.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: Prisma.DueDiligenceItemCreateInput): Promise<DueDiligenceItem> {
    return this.prisma.dueDiligenceItem.create({ data });
  }

  createMany(data: Prisma.DueDiligenceItemCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return this.prisma.dueDiligenceItem.createMany({ data });
  }

  update(id: string, data: Prisma.DueDiligenceItemUpdateInput): Promise<DueDiligenceItem> {
    return this.prisma.dueDiligenceItem.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<DueDiligenceItem> {
    return this.prisma.dueDiligenceItem.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
