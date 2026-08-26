import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EstimateRepository } from './estimate.repository';
import { ExplainerService } from '../ai/explainer.service';
import { computeEstimate, EstimateInputs, ESTIMATE_FORMULA_VERSION } from './estimate.engine';
import { ComputeEstimateDto, SaveEstimateDto } from './dto/compute-estimate.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class EstimateService {
  constructor(
    private readonly repo: EstimateRepository,
    private readonly explainer: ExplainerService,
  ) {}

  compute(dto: ComputeEstimateDto) {
    const outputs = computeEstimate(dto as EstimateInputs);
    return {
      formulaVersion: ESTIMATE_FORMULA_VERSION,
      outputs,
      explanation: this.explainer.explainEstimate(outputs),
    };
  }

  async save(user: AuthUser, dto: SaveEstimateDto) {
    const { opportunityId, label, ...inputs } = dto;
    const outputs = computeEstimate(inputs as EstimateInputs);
    const run = await this.repo.create({
      createdById: user.id,
      label,
      formulaVersion: ESTIMATE_FORMULA_VERSION,
      inputs: inputs as unknown as Prisma.InputJsonValue,
      outputs: outputs as unknown as Prisma.InputJsonValue,
      ...(opportunityId ? { opportunity: { connect: { id: opportunityId } } } : {}),
    });
    return { ...run, explanation: this.explainer.explainEstimate(outputs) };
  }

  listMine(user: AuthUser) {
    return this.repo.findByCreator(user.id);
  }

  async getOne(user: AuthUser, id: string) {
    const run = await this.repo.findById(id);
    if (!run) throw new NotFoundException('Estimate run not found');
    if (user.role !== 'ADMIN' && run.createdById !== user.id) {
      throw new ForbiddenException('You do not have access to this run');
    }
    return run;
  }
}
