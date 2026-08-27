import { Module } from '@nestjs/common';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';
import { IndicatorsRepository } from './indicators.repository';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [IndicatorsController],
  providers: [IndicatorsService, IndicatorsRepository],
})
export class IndicatorsModule {}
