import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { COUNTRY_INTELLIGENCE } from '../../common/reference/country-intelligence';
import { STRUCTURES } from '../../common/reference/opportunity-reference';
import { toUsd, BASE_CURRENCY, RATES_VERSION } from '../../common/reference/fx';

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
      valuedOpportunities,
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
      // Listings are priced in local currency, so the total has to be
      // normalised per row — a raw _sum would add PKR to USD one-for-one.
      this.prisma.opportunity.findMany({
        where: { status: 'PUBLISHED', deletedAt: null, projectValueCents: { not: null } },
        select: { projectValueCents: true, currency: true },
      }),
      this.prisma.opportunity.count({
        where: { status: 'PUBLISHED', deletedAt: null, verification: { not: 'T0' } },
      }),
      this.prisma.user.count(),
      this.prisma.document.count({ where: { deletedAt: null } }),
    ]);

    // Rows in a currency the reference table does not cover are left out of the
    // headline rather than counted at parity, and reported so the gap is visible.
    let totalUsd = 0;
    let excluded = 0;
    for (const row of valuedOpportunities) {
      const major = Number(row.projectValueCents) / 100;
      const usd = toUsd(major, row.currency);
      if (usd === null) excluded += 1;
      else totalUsd += usd;
    }

    return {
      // Live counts
      publishedOpportunities,
      activeMandates,
      countriesWithOpportunities: countriesRepresented.length,
      totalProjectValue: Math.round(totalUsd),
      totalProjectValueCurrency: BASE_CURRENCY,
      totalProjectValueRatesVersion: RATES_VERSION,
      totalProjectValueExcluded: excluded,
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
