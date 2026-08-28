import { Module } from '@nestjs/common';
import { TendersController } from './tenders.controller';
import { TendersService } from './tenders.service';
import { TendersRepository } from './tenders.repository';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [TendersController],
  providers: [TendersService, TendersRepository],
  exports: [TendersService],
})
export class TendersModule {}
