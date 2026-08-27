import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { MandatesModule } from './modules/mandates/mandates.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AccessModule } from './modules/access/access.module';
import { StorageModule } from './modules/storage/storage.module';
import { DataroomModule } from './modules/dataroom/dataroom.module';
import { DueDiligenceModule } from './modules/duediligence/duediligence.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AiModule } from './modules/ai/ai.module';
import { FeasibilityModule } from './modules/feasibility/feasibility.module';
import { ValuationModule } from './modules/valuation/valuation.module';
import { EstimateModule } from './modules/estimate/estimate.module';
import { RecommenderModule } from './modules/recommender/recommender.module';
import { OffersModule } from './modules/offers/offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    ReferenceModule,
    StorageModule,
    AccessModule,
    DataroomModule,
    DueDiligenceModule,
    VerificationModule,
    AiModule,
    FeasibilityModule,
    ValuationModule,
    EstimateModule,
    RecommenderModule,
    OffersModule,
    OpportunitiesModule,
    MatchingModule,
    MandatesModule,
  ],
})
export class AppModule {}
