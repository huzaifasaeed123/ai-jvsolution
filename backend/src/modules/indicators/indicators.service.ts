import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IndicatorsRepository } from './indicators.repository';
import { AccessService } from '../access/access.service';
import { buildIndicators, FeasibilitySnapshot } from './indicators.builder';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class IndicatorsService {
  constructor(
    private readonly repo: IndicatorsRepository,
    private readonly access: AccessService,
  ) {}

  async getDashboard(user: AuthUser | undefined, opportunityId: string) {
    const opp = await this.repo.getOpportunity(opportunityId);
    if (!opp) throw new NotFoundException('Opportunity not found');

    const privileged = !!user && (user.role === 'ADMIN' || user.id === opp.ownerId);
    const granted = privileged || (!!user && (await this.access.hasAccess(user.id, opportunityId)));
    if (!granted) {
      throw new ForbiddenException('The investor dashboard unlocks after access is granted');
    }

    const [feasRun, offers, dataRoom, dueDiligence] = await Promise.all([
      this.repo.getLatestFeasibility(opportunityId),
      this.repo.getOffers(opportunityId),
      this.repo.getDataRoomCounts(opportunityId),
      this.repo.getDueDiligence(opportunityId),
    ]);

    let feasibility: FeasibilitySnapshot | null = null;
    if (feasRun) {
      const o = feasRun.outputs as unknown as FeasibilitySnapshot;
      const a = feasRun.assumptions as unknown as { developmentMonths?: number };
      feasibility = { ...o, developmentMonths: a?.developmentMonths };
    }

    return buildIndicators({
      opportunity: {
        reference: opp.reference,
        title: opp.title,
        sector: opp.sector,
        countryCode: opp.countryCode,
        ownerCategory: opp.ownerCategory,
        status: opp.status,
        verification: opp.verification,
        permitStatus: opp.permitStatus,
        currency: opp.currency,
      },
      feasibility,
      offers: offers.map((o) => ({
        status: o.status,
        ownerSharePct: o.ownerSharePct,
        investmentAmount: o.investmentAmountCents === null ? null : Number(o.investmentAmountCents) / 100,
      })),
      dataRoom,
      dueDiligence,
    });
  }
}
