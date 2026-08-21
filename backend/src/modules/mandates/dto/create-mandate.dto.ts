import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerCategory, RiskLevel } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  SECTOR_CODES,
  PROJECT_TYPE_CODES,
  STRUCTURE_CODES,
} from '../../../common/reference/opportunity-reference';

export class CreateMandateDto {
  @ApiProperty({ example: 'GCC residential & mixed-use, $20–60M equity' })
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ enum: SECTOR_CODES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(SECTOR_CODES, { each: true })
  sectors?: string[];

  @ApiPropertyOptional({ description: 'ISO alpha-2 country codes', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 2, { each: true })
  countryCodes?: string[];

  @ApiPropertyOptional({ enum: PROJECT_TYPE_CODES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(PROJECT_TYPE_CODES, { each: true })
  projectTypes?: string[];

  @ApiPropertyOptional({ enum: STRUCTURE_CODES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(STRUCTURE_CODES, { each: true })
  structures?: string[];

  @ApiPropertyOptional({ enum: OwnerCategory, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(OwnerCategory, { each: true })
  ownerCategories?: OwnerCategory[];

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Min ticket size (major units)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minInvestment?: number;

  @ApiPropertyOptional({ description: 'Max ticket size (major units)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxInvestment?: number;

  @ApiPropertyOptional({ description: 'Target IRR %' })
  @IsOptional()
  @IsNumber()
  targetIrr?: number;

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskAppetite?: RiskLevel;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
