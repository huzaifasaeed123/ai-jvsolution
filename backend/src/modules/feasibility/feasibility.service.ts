import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FeasibilityRepository } from './feasibility.repository';
import { ExplainerService } from '../ai/explainer.service';
import {
  computeFeasibility,
  resolvedAssumptions,
  FEASIBILITY_FORMULA_VERSION,
  FeasibilityInputs,
} from './feasibility.engine';
import { ComputeFeasibilityDto, SaveFeasibilityDto } from './dto/compute-feasibility.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class FeasibilityService {
  constructor(
    private readonly repo: FeasibilityRepository,
    private readonly explainer: ExplainerService,
  ) {}

  /** Stateless calculation — the interactive studio. */
  compute(dto: ComputeFeasibilityDto) {
    const outputs = computeFeasibility(dto as FeasibilityInputs);
    return {
      formulaVersion: FEASIBILITY_FORMULA_VERSION,
      assumptions: resolvedAssumptions(dto as FeasibilityInputs),
      outputs,
      explanation: this.explainer.explainFeasibility(outputs),
    };
  }

  /** Compute + persist with full provenance (spec §42). */
  async save(user: AuthUser, dto: SaveFeasibilityDto) {
    const { opportunityId, label, ...inputs } = dto;
    const outputs = computeFeasibility(inputs as FeasibilityInputs);
    const assumptions = resolvedAssumptions(inputs as FeasibilityInputs);

    const run = await this.repo.create({
      createdById: user.id,
      label,
      formulaVersion: FEASIBILITY_FORMULA_VERSION,
      inputs: inputs as unknown as Prisma.InputJsonValue,
      assumptions: assumptions as unknown as Prisma.InputJsonValue,
      outputs: outputs as unknown as Prisma.InputJsonValue,
      ...(opportunityId ? { opportunity: { connect: { id: opportunityId } } } : {}),
    });

    return { ...run, explanation: this.explainer.explainFeasibility(outputs) };
  }

  async listMine(user: AuthUser) {
    return this.repo.findByCreator(user.id);
  }

  async getOne(user: AuthUser, id: string) {
    const run = await this.repo.findById(id);
    if (!run) throw new NotFoundException('Feasibility run not found');
    if (user.role !== 'ADMIN' && run.createdById !== user.id) {
      throw new ForbiddenException('You do not have access to this run');
    }
    return run;
  }
}
