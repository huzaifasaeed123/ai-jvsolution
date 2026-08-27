import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class CompareOffersDto {
  @ApiPropertyOptional({
    description: 'Optional criterion weights (ownerReturn, experience, financialCapacity, delivery, investment, guarantees). Normalized internally.',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @IsOptional()
  @IsObject()
  weights?: Record<string, number>;
}
