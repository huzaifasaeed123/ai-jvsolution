import { ApiProperty } from '@nestjs/swagger';
import { VerificationTier } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class SetVerificationDto {
  @ApiProperty({ enum: VerificationTier })
  @IsEnum(VerificationTier)
  tier!: VerificationTier;
}
