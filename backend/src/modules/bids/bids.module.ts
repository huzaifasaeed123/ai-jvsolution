import { Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { BidsRepository } from './bids.repository';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [BidsController],
  providers: [BidsService, BidsRepository],
  exports: [BidsService],
})
export class BidsModule {}
