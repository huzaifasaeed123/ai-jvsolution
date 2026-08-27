import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CONSORTIUM_ROLE_CODES } from '../../../common/reference/consortium-roles';

export class CreateConsortiumDto {
  @ApiProperty({ example: 'Marina Towers consortium' })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Attach to an opportunity' })
  @IsOptional()
  @IsString()
  opportunityId?: string;
}

export class InviteMemberDto {
  @ApiProperty({ description: 'Email of a registered user to invite' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: CONSORTIUM_ROLE_CODES })
  @IsIn(CONSORTIUM_ROLE_CODES)
  role!: string;

  @ApiPropertyOptional({ description: 'Equity share %' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  equityPct?: number;
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: CONSORTIUM_ROLE_CODES })
  @IsOptional()
  @IsIn(CONSORTIUM_ROLE_CODES)
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  equityPct?: number;
}
