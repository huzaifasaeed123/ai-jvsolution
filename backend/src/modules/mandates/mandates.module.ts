import { Module } from '@nestjs/common';
import { MandatesController } from './mandates.controller';
import { MandatesService } from './mandates.service';
import { MandatesRepository } from './mandates.repository';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [MatchingModule],
  controllers: [MandatesController],
  providers: [MandatesService, MandatesRepository],
  exports: [MandatesService],
})
export class MandatesModule {}
