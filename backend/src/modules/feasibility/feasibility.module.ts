import { Module } from '@nestjs/common';
import { FeasibilityController } from './feasibility.controller';
import { FeasibilityService } from './feasibility.service';
import { FeasibilityRepository } from './feasibility.repository';

@Module({
  controllers: [FeasibilityController],
  providers: [FeasibilityService, FeasibilityRepository],
  exports: [FeasibilityService],
})
export class FeasibilityModule {}
