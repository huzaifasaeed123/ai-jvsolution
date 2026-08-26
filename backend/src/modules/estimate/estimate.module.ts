import { Module } from '@nestjs/common';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';
import { EstimateRepository } from './estimate.repository';

@Module({
  controllers: [EstimateController],
  providers: [EstimateService, EstimateRepository],
  exports: [EstimateService],
})
export class EstimateModule {}
