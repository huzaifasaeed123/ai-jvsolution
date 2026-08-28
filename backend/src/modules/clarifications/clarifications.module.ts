import { Module } from '@nestjs/common';
import { ClarificationsController } from './clarifications.controller';
import { ClarificationsService } from './clarifications.service';
import { ClarificationsRepository } from './clarifications.repository';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [ClarificationsController],
  providers: [ClarificationsService, ClarificationsRepository],
  exports: [ClarificationsService],
})
export class ClarificationsModule {}
