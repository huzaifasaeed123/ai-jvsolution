import { ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerCategory, RiskLevel } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  SECTOR_CODES,
  PROJECT_TYPE_CODES,
  STRUCTURE_CODES,
} from '../../../common/reference/opportunity-reference';

/** Public browse filters (spec §31) + pagination. */
export class QueryOpportunityDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ description: 'Free-text search on title/summary' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ enum: SECTOR_CODES })
  @IsOptional()
  @IsIn(SECTOR_CODES)
  sector?: string;

  @ApiPropertyOptional({ enum: PROJECT_TYPE_CODES })
  @IsOptional()
  @IsIn(PROJECT_TYPE_CODES)
  projectType?: string;

  @ApiPropertyOptional({ enum: OwnerCategory })
  @IsOptional()
  @IsEnum(OwnerCategory)
  ownerCategory?: OwnerCategory;

  @ApiPropertyOptional({ enum: STRUCTURE_CODES, description: 'Filter by an applicable structure' })
  @IsOptional()
  @IsIn(STRUCTURE_CODES)
  structure?: string;

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ description: 'Min required investment (major units)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minInvestment?: number;

  @ApiPropertyOptional({ description: 'Max required investment (major units)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxInvestment?: number;
}
