import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBidDto {
  @ApiPropertyOptional({ description: 'Bid as a consortium (spec §15)' })
  @IsOptional() @IsString() consortiumId?: string;

  // Technical envelope
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) technicalProposal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) methodology?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) deliveryMonths?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) experienceYears?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) keyPersonnel?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) localContentPct?: number;

  // Financial envelope
  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional() @IsString() @Length(3, 3) currency?: string;

  @ApiPropertyOptional({ description: 'Headline bid price (major units)' })
  @IsOptional() @IsNumber() @Min(0) bidPrice?: number;

  @ApiPropertyOptional({ description: 'Annual availability/concession payment (major units)' })
  @IsOptional() @IsNumber() @Min(0) annualPayment?: number;

  @ApiPropertyOptional({ description: 'Revenue share offered to the authority (%)' })
  @IsOptional() @IsNumber() @Min(0) @Max(100) revenueSharePct?: number;

  @ApiPropertyOptional({ description: 'Financial capacity (major units)' })
  @IsOptional() @IsNumber() @Min(0) financialCapacity?: number;

  // Compliance
  @ApiPropertyOptional() @IsOptional() @IsBoolean() bidSecurityProvided?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() checklistComplete?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) declarations?: string;
}

export class UpdateBidDto extends PartialType(CreateBidDto) {}

export class DisqualifyBidDto {
  @ApiProperty({ description: 'Why the bid fails a mandatory requirement' })
  @IsString()
  @MaxLength(500)
  reason!: string;
}
