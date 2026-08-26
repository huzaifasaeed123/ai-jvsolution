import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export const VALUATION_METHODS = ['residual', 'comparable', 'income', 'dcf'] as const;

export class ComputeValuationDto {
  @ApiProperty({ enum: VALUATION_METHODS })
  @IsIn(VALUATION_METHODS as unknown as string[])
  method!: (typeof VALUATION_METHODS)[number];

  @ApiProperty({ description: 'Method-specific inputs (validated in the service)' })
  @IsObject()
  inputs!: Record<string, unknown>;
}

export class SaveValuationDto extends ComputeValuationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;
}
