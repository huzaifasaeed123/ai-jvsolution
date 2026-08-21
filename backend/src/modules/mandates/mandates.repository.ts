import { Injectable } from '@nestjs/common';
import { Prisma, Mandate } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/** All Prisma access for the mandates domain. */
@Injectable()
export class MandatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MandateCreateInput): Promise<Mandate> {
    return this.prisma.mandate.create({ data });
  }

  findById(id: string): Promise<Mandate | null> {
    return this.prisma.mandate.findFirst({ where: { id, deletedAt: null } });
  }

  findByOwner(ownerId: string): Promise<Mandate[]> {
    return this.prisma.mandate.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findActiveByOwner(ownerId: string): Promise<Mandate[]> {
    return this.prisma.mandate.findMany({
      where: { ownerId, deletedAt: null, active: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.MandateUpdateInput): Promise<Mandate> {
    return this.prisma.mandate.update({ where: { id }, data });
  }

  softDelete(id: string): Promise<Mandate> {
    return this.prisma.mandate.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
