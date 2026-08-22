import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { AccessRepository } from './access.repository';
import { AuditService } from './audit.service';

@Module({
  controllers: [AccessController],
  providers: [AccessService, AccessRepository, AuditService],
  exports: [AccessService, AuditService],
})
export class AccessModule {}
