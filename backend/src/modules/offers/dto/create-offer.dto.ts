import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { STRUCTURE_CODES } from '../../../common/reference/opportunity-reference';

export class CreateOfferDto {
  @ApiPropertyOptional({ enum: OfferType, default: 'OFFER' })
  @IsOptional()
  @IsEnum(OfferType)
  type?: OfferType;

  @ApiPropertyOptional({ enum: STRUCTURE_CODES, description: 'Proposed JV structure' })
  @IsOptional()
  @IsIn(STRUCTURE_CODES)
  structure?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Capital offered (major units)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  investmentAmount?: number;

  @ApiPropertyOptional({ description: 'Return offered to the owner (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ownerSharePct?: number;

  @ApiPropertyOptional({ description: 'Target IRR %' })
  @IsOptional()
  @IsNumber()
  targetIrr?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) developmentMonths?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) experienceYears?: number;

  @ApiPropertyOptional({ description: 'Financial capacity (major units)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  financialCapacity?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) guarantees?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) message?: string;
}
