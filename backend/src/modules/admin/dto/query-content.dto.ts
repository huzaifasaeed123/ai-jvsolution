import { ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityStatus, TenderStage, VerificationTier } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Shared paging for admin tables. */
class Paged {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 25, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @ApiPropertyOptional({ description: 'Matches title or reference' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Include soft-deleted rows' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeDeleted?: boolean;
}

export class QueryOpportunitiesDto extends Paged {
  @ApiPropertyOptional({ enum: OpportunityStatus })
  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @ApiPropertyOptional({ enum: VerificationTier })
  @IsOptional()
  @IsEnum(VerificationTier)
  verification?: VerificationTier;

  @ApiPropertyOptional({ example: 'AE' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class QueryTendersDto extends Paged {
  @ApiPropertyOptional({ enum: TenderStage })
  @IsOptional()
  @IsEnum(TenderStage)
  stage?: TenderStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorityId?: string;
}
