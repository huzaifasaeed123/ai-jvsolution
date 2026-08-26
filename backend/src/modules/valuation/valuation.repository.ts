import { Injectable } from '@nestjs/common';
import { Prisma, ValuationRun } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ValuationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ValuationRunCreateInput): Promise<ValuationRun> {
    return this.prisma.valuationRun.create({ data });
  }

  findById(id: string): Promise<ValuationRun | null> {
    return this.prisma.valuationRun.findUnique({ where: { id } });
  }

  findByCreator(createdById: string): Promise<ValuationRun[]> {
    return this.prisma.valuationRun.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
