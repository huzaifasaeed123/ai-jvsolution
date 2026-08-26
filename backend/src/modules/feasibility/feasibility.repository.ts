import { Injectable } from '@nestjs/common';
import { Prisma, FeasibilityRun } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeasibilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.FeasibilityRunCreateInput): Promise<FeasibilityRun> {
    return this.prisma.feasibilityRun.create({ data });
  }

  findById(id: string): Promise<FeasibilityRun | null> {
    return this.prisma.feasibilityRun.findUnique({ where: { id } });
  }

  findByCreator(createdById: string): Promise<FeasibilityRun[]> {
    return this.prisma.feasibilityRun.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findByOpportunity(opportunityId: string): Promise<FeasibilityRun[]> {
    return this.prisma.feasibilityRun.findMany({
      where: { opportunityId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
