import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';

export class ComputeFeasibilityDto {
  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty() @IsNumber() @IsPositive() gfaSqm!: number;
  @ApiPropertyOptional({ description: 'NSA / GFA %, default 80' }) @IsOptional() @IsNumber() @Min(1) efficiencyPct?: number;
  @ApiProperty() @IsNumber() @IsPositive() salePricePerSqm!: number;
  @ApiProperty() @IsNumber() @IsPositive() constructionCostPerSqm!: number;
  @ApiProperty() @IsNumber() @Min(0) landCost!: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) professionalFeesPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) contingencyPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) marketingPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) sellingCostsPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) developmentMonths?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) debtRatioPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) financeRatePct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) discountRatePct?: number;
}

export class SaveFeasibilityDto extends ComputeFeasibilityDto {
  @ApiPropertyOptional({ description: 'Attach the run to an opportunity' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;
}
