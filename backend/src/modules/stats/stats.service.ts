import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { COUNTRY_INTELLIGENCE } from '../../common/reference/country-intelligence';
import { STRUCTURES } from '../../common/reference/opportunity-reference';

/**
 * Public platform statistics (spec §2 "public statistics area", §3 "make
 * statistics dynamic from the database"). Every figure is COUNTED LIVE — none
 * are hard-coded. Only non-confidential aggregates are exposed.
 */
@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async publicStats() {
    const [
      publishedOpportunities,
      activeMandates,
      countriesRepresented,
      totalGdvCents,
      verifiedOpportunities,
      partners,
      documents,
    ] = await Promise.all([
      this.prisma.opportunity.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
      this.prisma.mandate.count({ where: { active: true, deletedAt: null } }),
      this.prisma.opportunity.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        distinct: ['countryCode'],
        select: { countryCode: true },
      }),
      this.prisma.opportunity.aggregate({
        where: { status: 'PUBLISHED', deletedAt: null },
        _sum: { projectValueCents: true },
      }),
      this.prisma.opportunity.count({
        where: { status: 'PUBLISHED', deletedAt: null, verification: { not: 'T0' } },
      }),
      this.prisma.user.count(),
      this.prisma.document.count({ where: { deletedAt: null } }),
    ]);

    const gdv = totalGdvCents._sum.projectValueCents;

    return {
      // Live counts
      publishedOpportunities,
      activeMandates,
      countriesWithOpportunities: countriesRepresented.length,
      totalProjectValue: gdv === null ? 0 : Number(gdv) / 100,
      verifiedOpportunities,
      partners,
      documentsSecured: documents,
      // Platform capability (reference data, not deal data)
      marketsCovered: COUNTRY_INTELLIGENCE.length,
      structuresSupported: STRUCTURES.length,
      generatedAt: new Date().toISOString(),
    };
  }
}
