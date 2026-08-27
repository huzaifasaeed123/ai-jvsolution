import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OffersRepository } from './offers.repository';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [OffersController],
  providers: [OffersService, OffersRepository],
  exports: [OffersService],
})
export class OffersModule {}
