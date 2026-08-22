import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationTier } from '@prisma/client';
import { IsArray, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { VERIFIABLE_FIELD_CODES } from '../../../common/reference/verification-reference';

export class SetVerificationDto {
  @ApiProperty({ enum: VerificationTier })
  @IsEnum(VerificationTier)
  tier!: VerificationTier;

  @ApiPropertyOptional({ enum: VERIFIABLE_FIELD_CODES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(VERIFIABLE_FIELD_CODES, { each: true })
  verifiedFields?: string[];

  @ApiPropertyOptional({ isArray: true, description: 'Free-text unresolved items' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  unresolvedItems?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
