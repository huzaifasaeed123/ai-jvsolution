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
    AccessModule,
    OpportunitiesModule,
    MatchingModule,
    MandatesModule,
  ],
})
export class AppModule {}
