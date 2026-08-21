import { Injectable } from '@nestjs/common';
import { Mandate } from '@prisma/client';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { OpportunitySerializer } from '../opportunities/opportunity.serializer';
import { scoreFit, MandateLike } from './fit-score';

@Injectable()
export class MatchingService {
  constructor(private readonly opportunities: OpportunitiesService) {}

  /**
   * Score published opportunities against a mandate and return the best matches.
   * Opportunities are returned in PUBLIC view (confidential fields stay hidden);
   * each carries an explainable Fit Score.
   */
  async matchesForMandate(mandate: Mandate, limit = 20) {
    const m: MandateLike = {
      sectors: mandate.sectors,
      countryCodes: mandate.countryCodes,
      structures: mandate.structures,
      ownerCategories: mandate.ownerCategories,
      minInvestmentCents: mandate.minInvestmentCents,
      maxInvestmentCents: mandate.maxInvestmentCents,
      targetIrr: mandate.targetIrr,
      riskAppetite: mandate.riskAppetite,
    };

    const candidates = await this.opportunities.findMatchCandidates({
      countryCodes: mandate.countryCodes,
      sectors: mandate.sectors,
    });

    const matches = candidates
      .map((op) => ({
        opportunity: OpportunitySerializer.toPublic(op),
        fit: scoreFit(
          {
            sector: op.sector,
            countryCode: op.countryCode,
            investmentRequiredCents: op.investmentRequiredCents,
            structures: op.structures,
            targetIrr: op.targetIrr,
            ownerCategory: op.ownerCategory,
            riskLevel: op.riskLevel,
          },
          m,
        ),
      }))
      .sort((a, b) => b.fit.score - a.fit.score)
      .slice(0, limit);

    return { mandateId: mandate.id, count: matches.length, matches };
  }
}
