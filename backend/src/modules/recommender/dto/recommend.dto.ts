import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerCategory } from '@prisma/client';
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, Min } from 'class-validator';

const LEVELS = ['low', 'medium', 'high'] as const;

export class RecommendDto {
  @ApiProperty({ enum: OwnerCategory })
  @IsEnum(OwnerCategory)
  ownerType!: OwnerCategory;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() landOwnershipRetained?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() financingRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() userPay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() governmentPay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() transferRequired?: boolean;

  @ApiPropertyOptional({ enum: LEVELS })
  @IsOptional() @IsIn(LEVELS as unknown as string[]) revenueCertainty?: (typeof LEVELS)[number];

  @ApiPropertyOptional({ enum: LEVELS })
  @IsOptional() @IsIn(LEVELS as unknown as string[]) riskAppetite?: (typeof LEVELS)[number];

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) concessionTermYears?: number;
}
