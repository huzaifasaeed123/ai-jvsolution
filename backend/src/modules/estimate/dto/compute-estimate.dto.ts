import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';
import { SPEC_LEVEL_CODES } from '../../../common/reference/estimate-reference';

export class ComputeEstimateDto {
  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional() @IsString() @Length(3, 3) currency?: string;

  @ApiProperty() @IsNumber() @IsPositive() areaSqm!: number;

  @ApiPropertyOptional({ enum: SPEC_LEVEL_CODES })
  @IsOptional() @IsIn(SPEC_LEVEL_CODES) specLevel?: string;

  @ApiPropertyOptional({ description: 'Overrides the spec-level rate' })
  @IsOptional() @IsNumber() @Min(0) baseRatePerSqm?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) externalWorksPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) professionalFeesPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) authorityFeesPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) contingencyPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) escalationPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) insurancePct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) units?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unitBasis?: string;
}

export class SaveEstimateDto extends ComputeEstimateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() opportunityId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() label?: string;
}
