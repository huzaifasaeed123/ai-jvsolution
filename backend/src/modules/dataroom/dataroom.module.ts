import { Module } from '@nestjs/common';
import { DataroomController } from './dataroom.controller';
import { DataroomService } from './dataroom.service';
import { DataroomRepository } from './dataroom.repository';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [DataroomController],
  providers: [DataroomService, DataroomRepository],
  exports: [DataroomService],
})
export class DataroomModule {}
