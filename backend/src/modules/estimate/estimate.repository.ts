import { Injectable } from '@nestjs/common';
import { Prisma, EstimateRun } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EstimateRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EstimateRunCreateInput): Promise<EstimateRun> {
    return this.prisma.estimateRun.create({ data });
  }

  findById(id: string): Promise<EstimateRun | null> {
    return this.prisma.estimateRun.findUnique({ where: { id } });
  }

  findByCreator(createdById: string): Promise<EstimateRun[]> {
    return this.prisma.estimateRun.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
