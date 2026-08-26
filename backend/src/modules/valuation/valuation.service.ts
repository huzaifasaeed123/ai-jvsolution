import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ValuationRepository } from './valuation.repository';
import { ExplainerService } from '../ai/explainer.service';
import {
  computeComparable,
  computeDcf,
  computeIncome,
  computeResidual,
  ValuationMethod,
  ValuationResult,
  VALUATION_FORMULA_VERSION,
} from './valuation.engine';
import { SaveValuationDto } from './dto/compute-valuation.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ValuationService {
  constructor(
    private readonly repo: ValuationRepository,
    private readonly explainer: ExplainerService,
  ) {}

  compute(method: ValuationMethod, inputs: Record<string, unknown>) {
    const outputs = this.run(method, inputs);
    const currency = (inputs.currency as string) ?? 'USD';
    return {
      method,
      formulaVersion: VALUATION_FORMULA_VERSION,
      outputs,
      explanation: this.explainer.explainValuation(currency, outputs),
    };
  }

  async save(user: AuthUser, dto: SaveValuationDto) {
    const outputs = this.run(dto.method, dto.inputs);
    const run = await this.repo.create({
      createdById: user.id,
      method: dto.method,
      label: dto.label,
      formulaVersion: VALUATION_FORMULA_VERSION,
      inputs: dto.inputs as unknown as Prisma.InputJsonValue,
      assumptions: { formulaVersion: VALUATION_FORMULA_VERSION } as unknown as Prisma.InputJsonValue,
      outputs: outputs as unknown as Prisma.InputJsonValue,
      ...(dto.opportunityId ? { opportunity: { connect: { id: dto.opportunityId } } } : {}),
    });
    const currency = (dto.inputs.currency as string) ?? 'USD';
    return { ...run, explanation: this.explainer.explainValuation(currency, outputs) };
  }

  listMine(user: AuthUser) {
    return this.repo.findByCreator(user.id);
  }

  async getOne(user: AuthUser, id: string) {
    const run = await this.repo.findById(id);
    if (!run) throw new NotFoundException('Valuation run not found');
    if (user.role !== 'ADMIN' && run.createdById !== user.id) {
      throw new ForbiddenException('You do not have access to this run');
    }
    return run;
  }

  // ---- dispatch + per-method validation ----

  private run(method: ValuationMethod, i: Record<string, unknown>): ValuationResult {
    switch (method) {
      case 'residual':
        this.require(i, ['gfaSqm', 'salePricePerSqm', 'constructionCostPerSqm']);
        return computeResidual(i as never);
      case 'comparable':
        if (!Array.isArray(i.comparables) || i.comparables.length === 0) {
          throw new BadRequestException('comparable requires a non-empty "comparables" array');
        }
        this.require(i, ['areaSqm']);
        return computeComparable(i as never);
      case 'income':
        this.require(i, ['annualRentPerSqm', 'leasableAreaSqm', 'capRatePct']);
        return computeIncome(i as never);
      case 'dcf':
        if (!Array.isArray(i.cashflows) || i.cashflows.length === 0) {
          throw new BadRequestException('dcf requires a non-empty "cashflows" array');
        }
        this.require(i, ['discountRatePct']);
        return computeDcf(i as never);
      default:
        throw new BadRequestException(`Unknown method: ${method as string}`);
    }
  }

  private require(i: Record<string, unknown>, keys: string[]) {
    const missing = keys.filter((k) => typeof i[k] !== 'number' || Number.isNaN(i[k]));
    if (missing.length) {
      throw new BadRequestException(`Missing/invalid numeric inputs: ${missing.join(', ')}`);
    }
  }
}
