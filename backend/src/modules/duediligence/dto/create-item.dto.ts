import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiskRating, ReceiptStatus, DdReviewStatus, ClosureStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DD_CATEGORY_CODES } from '../../../common/reference/duediligence-categories';

export class CreateDueDiligenceItemDto {
  @ApiProperty({ enum: DD_CATEGORY_CODES })
  @IsIn(DD_CATEGORY_CODES)
  category!: string;

  @ApiProperty({ example: 'Title deed & registry extract' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ enum: ReceiptStatus })
  @IsOptional()
  @IsEnum(ReceiptStatus)
  receipt?: ReceiptStatus;

  @ApiPropertyOptional({ enum: DdReviewStatus })
  @IsOptional()
  @IsEnum(DdReviewStatus)
  reviewStatus?: DdReviewStatus;

  @ApiPropertyOptional({ enum: RiskRating })
  @IsOptional()
  @IsEnum(RiskRating)
  riskRating?: RiskRating;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) finding?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) recommendation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) responsibleParty?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) mitigation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) evidence?: string;

  @ApiPropertyOptional({ description: 'ISO date' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ enum: ClosureStatus })
  @IsOptional()
  @IsEnum(ClosureStatus)
  closure?: ClosureStatus;
}
