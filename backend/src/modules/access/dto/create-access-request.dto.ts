import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAccessRequestDto {
  @ApiProperty({ description: 'Opportunity to request confidential access to' })
  @IsString()
  @MinLength(1)
  opportunityId!: string;

  @ApiPropertyOptional({ description: 'Optional note to the owner' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
