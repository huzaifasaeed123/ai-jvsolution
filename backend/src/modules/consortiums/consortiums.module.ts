import { Module } from '@nestjs/common';
import { ConsortiumsController } from './consortiums.controller';
import { ConsortiumsService } from './consortiums.service';
import { ConsortiumsRepository } from './consortiums.repository';

@Module({
  controllers: [ConsortiumsController],
  providers: [ConsortiumsService, ConsortiumsRepository],
  exports: [ConsortiumsService],
})
export class ConsortiumsModule {}
