import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { OpportunitiesModule } from '../opportunities/opportunities.module';

@Module({
  imports: [OpportunitiesModule],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
