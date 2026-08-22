import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationRepository } from './verification.repository';
import { OpportunitiesModule } from '../opportunities/opportunities.module';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [OpportunitiesModule, AccessModule],
  controllers: [VerificationController],
  providers: [VerificationService, VerificationRepository],
})
export class VerificationModule {}
