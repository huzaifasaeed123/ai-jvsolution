import { Injectable } from '@nestjs/common';
import { Prisma, VerificationRecord } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  getOpportunity(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true, verification: true },
    });
  }

  findByOpportunity(opportunityId: string): Promise<VerificationRecord | null> {
    return this.prisma.verificationRecord.findUnique({ where: { opportunityId } });
  }

  upsert(
    opportunityId: string,
    data: Omit<Prisma.VerificationRecordCreateInput, 'opportunity'>,
  ): Promise<VerificationRecord> {
    return this.prisma.verificationRecord.upsert({
      where: { opportunityId },
      create: { ...data, opportunity: { connect: { id: opportunityId } } },
      update: data,
    });
  }
}
