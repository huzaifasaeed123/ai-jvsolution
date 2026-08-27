import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Read-model: aggregates raw data across modules for the investor dashboard. */
@Injectable()
export class IndicatorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getOpportunity(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        ownerId: true,
        reference: true,
        title: true,
        sector: true,
        countryCode: true,
        ownerCategory: true,
        status: true,
        verification: true,
        permitStatus: true,
        currency: true,
      },
    });
  }

  getLatestFeasibility(opportunityId: string) {
    return this.prisma.feasibilityRun.findFirst({
      where: { opportunityId },
      orderBy: { createdAt: 'desc' },
      select: { outputs: true, assumptions: true },
    });
  }

  getOffers(opportunityId: string) {
    return this.prisma.offer.findMany({
      where: { opportunityId, deletedAt: null },
      select: { status: true, ownerSharePct: true, investmentAmountCents: true },
    });
  }

  async getDataRoomCounts(opportunityId: string) {
    const [totalFolders, documentCount, distinctFolders] = await Promise.all([
      this.prisma.folder.count({ where: { opportunityId } }),
      this.prisma.document.count({ where: { opportunityId, deletedAt: null } }),
      this.prisma.document.findMany({
        where: { opportunityId, deletedAt: null },
        distinct: ['folderId'],
        select: { folderId: true },
      }),
    ]);
    return { totalFolders, documentCount, foldersWithDocs: distinctFolders.length };
  }

  async getDueDiligence(opportunityId: string) {
    const items = await this.prisma.dueDiligenceItem.findMany({
      where: { opportunityId, deletedAt: null },
      select: { riskRating: true, closure: true },
    });
    const byRisk: Record<string, number> = {};
    let closed = 0;
    for (const i of items) {
      if (i.riskRating) byRisk[i.riskRating] = (byRisk[i.riskRating] ?? 0) + 1;
      if (i.closure === 'CLOSED') closed++;
    }
    return { total: items.length, closed, byRisk };
  }
}
