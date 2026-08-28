import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProcurementType, TenderStage } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
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
  ValidateNested,
} from 'class-validator';
import {
  PAYMENT_MECHANISM_CODES,
  RISK_BEARER_CODES,
} from '../../../common/reference/procurement-reference';

export class RiskAllocationItemDto {
  @ApiProperty({ description: 'Risk category code or free text' })
  @IsString()
  @MaxLength(80)
  risk!: string;

  @ApiProperty({ enum: RISK_BEARER_CODES })
  @IsIn(RISK_BEARER_CODES)
  bearer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class EvaluationCriterionDto {
  @ApiProperty() @IsString() @MaxLength(40) key!: string;
  @ApiProperty() @IsString() @MaxLength(80) label!: string;

  @ApiProperty({ description: 'Relative weight (normalized at evaluation)' })
  @IsNumber()
  @Min(0)
  weight!: number;
}

export class CreateTenderDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ enum: ProcurementType })
  @IsOptional()
  @IsEnum(ProcurementType)
  procurementType?: ProcurementType;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) employerRequirements?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) outputSpecification?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3000) siteInformation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3000) governmentSupport?: string;

  @ApiPropertyOptional({ enum: PAYMENT_MECHANISM_CODES })
  @IsOptional()
  @IsIn(PAYMENT_MECHANISM_CODES)
  paymentMechanism?: string;

  @ApiPropertyOptional({ type: [RiskAllocationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskAllocationItemDto)
  riskAllocation?: RiskAllocationItemDto[];

  @ApiPropertyOptional({ type: [EvaluationCriterionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriterionDto)
  evaluationCriteria?: EvaluationCriterionDto[];

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional() @IsString() @Length(3, 3) currency?: string;

  @ApiPropertyOptional({ description: 'Estimated contract value (major units)' })
  @IsOptional() @IsNumber() @Min(0) estimatedValue?: number;

  @ApiPropertyOptional({ description: 'Bid security / bond (major units)' })
  @IsOptional() @IsNumber() @Min(0) bidSecurity?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) concessionYears?: number;

  @ApiPropertyOptional({ description: 'ISO date-time' })
  @IsOptional() @IsDateString() clarificationDeadline?: string;

  @ApiPropertyOptional({ description: 'ISO date-time — bids are refused after this' })
  @IsOptional() @IsDateString() submissionDeadline?: string;
}

export class UpdateTenderDto extends PartialType(CreateTenderDto) {}

export class SetTenderStageDto {
  @ApiProperty({ enum: TenderStage })
  @IsEnum(TenderStage)
  stage!: TenderStage;
}
