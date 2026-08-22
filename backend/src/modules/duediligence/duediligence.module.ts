import { Module } from '@nestjs/common';
import { DueDiligenceController } from './duediligence.controller';
import { DueDiligenceService } from './duediligence.service';
import { DueDiligenceRepository } from './duediligence.repository';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [DueDiligenceController],
  providers: [DueDiligenceService, DueDiligenceRepository],
  exports: [DueDiligenceService],
})
export class DueDiligenceModule {}
