import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerCategory, RiskLevel, PermitStatus, DataRoomReadiness } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
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

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Waterfront mixed-use plot, Business Bay' })
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @ApiProperty({ description: 'Sector code', enum: SECTOR_CODES })
  @IsIn(SECTOR_CODES)
  sector!: string;

  @ApiPropertyOptional({ description: 'Project type code', enum: PROJECT_TYPE_CODES })
  @IsOptional()
  @IsIn(PROJECT_TYPE_CODES)
  projectType?: string;

  @ApiProperty({ enum: OwnerCategory })
  @IsEnum(OwnerCategory)
  ownerCategory!: OwnerCategory;

  // --- Location ---
  @ApiProperty({ example: 'AE', description: 'ISO-3166 alpha-2' })
  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Confidential — hidden until access granted' })
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional({ description: 'Confidential' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Confidential' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  // --- Physical / planning ---
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) landAreaSqm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) gfaSqm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) buaSqm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) nsaSqm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) plotRatio?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() landUse?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() heightLimit?: string;

  // --- Commercial (major currency units) ---
  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Gross Development Value in major currency units' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  projectValue?: number;

  @ApiPropertyOptional({ description: 'Required investment in major currency units' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  investmentRequired?: number;

  @ApiPropertyOptional({ description: 'Target IRR %' })
  @IsOptional()
  @IsNumber()
  targetIrr?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) developmentPeriodMonths?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) concessionPeriodYears?: number;

  // --- Structure & risk ---
  @ApiPropertyOptional({ description: 'Structure codes', enum: STRUCTURE_CODES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(STRUCTURE_CODES, { each: true })
  structures?: string[];

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ enum: PermitStatus })
  @IsOptional()
  @IsEnum(PermitStatus)
  permitStatus?: PermitStatus;

  @ApiPropertyOptional({ enum: DataRoomReadiness })
  @IsOptional()
  @IsEnum(DataRoomReadiness)
  dataRoomReadiness?: DataRoomReadiness;

  // --- Partner requirements ---
  @ApiPropertyOptional() @IsOptional() @IsString() requiredDeveloperExperience?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() requiredContractorClass?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() requiredOperatorType?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() financingRequired?: boolean;
}
