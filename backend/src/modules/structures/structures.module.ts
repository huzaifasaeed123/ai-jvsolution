import { Module } from '@nestjs/common';
import { StructuresController } from './structures.controller';

@Module({
  controllers: [StructuresController],
})
export class StructuresModule {}
