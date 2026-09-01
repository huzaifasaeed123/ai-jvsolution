import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccessStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAuditDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 50, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit = 50;

  @ApiPropertyOptional({ example: 'BID_AWARDED' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Who performed the action' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ description: 'Who it was done to' })
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Inclusive start date' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Inclusive end date' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class QueryAccessRequestsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 25, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;

  @ApiPropertyOptional({ enum: AccessStatus })
  @IsOptional()
  @IsEnum(AccessStatus)
  status?: AccessStatus;
}

export class PruneAuditDto {
  @ApiPropertyOptional({ default: 365, minimum: 30, description: 'Keep this many days' })
  @Type(() => Number)
  @IsInt()
  @Min(30)
  @Max(3650)
  days = 365;
}
