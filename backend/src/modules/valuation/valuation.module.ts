import { Module } from '@nestjs/common';
import { ValuationController } from './valuation.controller';
import { ValuationService } from './valuation.service';
import { ValuationRepository } from './valuation.repository';

@Module({
  controllers: [ValuationController],
  providers: [ValuationService, ValuationRepository],
  exports: [ValuationService],
})
export class ValuationModule {}
