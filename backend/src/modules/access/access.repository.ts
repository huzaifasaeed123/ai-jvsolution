import { Injectable } from '@nestjs/common';
import { AccessRequest, AccessStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type AccessRequestWithRelations = Prisma.AccessRequestGetPayload<{
  include: {
    requester: { select: { id: true; fullName: true; email: true } };
    opportunity: { select: { id: true; reference: true; title: true } };
  };
}>;

const relations = {
  requester: { select: { id: true, fullName: true, email: true } },
  opportunity: { select: { id: true, reference: true, title: true } },
} satisfies Prisma.AccessRequestInclude;

@Injectable()
export class AccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Minimal opportunity lookup for ownership/validation (read-only, avoids a
   * circular module dependency on OpportunitiesModule). */
  getOpportunityMeta(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, ownerId: true, status: true },
    });
  }

  create(data: Prisma.AccessRequestCreateInput): Promise<AccessRequestWithRelations> {
    return this.prisma.accessRequest.create({ data, include: relations });
  }

  findById(id: string): Promise<AccessRequestWithRelations | null> {
    return this.prisma.accessRequest.findUnique({ where: { id }, include: relations });
  }

  findByOpportunityAndRequester(
    opportunityId: string,
    requesterId: string,
  ): Promise<AccessRequestWithRelations | null> {
    return this.prisma.accessRequest.findUnique({
      where: { opportunityId_requesterId: { opportunityId, requesterId } },
      include: relations,
    });
  }

  findIncoming(ownerId: string): Promise<AccessRequestWithRelations[]> {
    return this.prisma.accessRequest.findMany({
      where: { ownerId },
      include: relations,
      orderBy: { createdAt: 'desc' },
    });
  }

  findMine(requesterId: string): Promise<AccessRequestWithRelations[]> {
    return this.prisma.accessRequest.findMany({
      where: { requesterId },
      include: relations,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.AccessRequestUpdateInput): Promise<AccessRequestWithRelations> {
    return this.prisma.accessRequest.update({ where: { id }, data, include: relations });
  }

  /** True if this user has an approved + NDA-signed grant for the opportunity. */
  async hasGrant(opportunityId: string, requesterId: string): Promise<boolean> {
    const row = await this.prisma.accessRequest.findUnique({
      where: { opportunityId_requesterId: { opportunityId, requesterId } },
      select: { status: true, ndaSignedAt: true },
    });
    return !!row && row.status === AccessStatus.APPROVED && row.ndaSignedAt !== null;
  }
}
