import { ApiProperty } from '@nestjs/swagger';
import { AccessLevel, Role } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class SetRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;
}

export class SetAccessLevelDto {
  @ApiProperty({ enum: AccessLevel })
  @IsEnum(AccessLevel)
  accessLevel!: AccessLevel;
}

/**
 * A reason is mandatory on every destructive action. It lands in the audit
 * trail, and it is what the person on the other end is told.
 */
export class ReasonDto {
  @ApiProperty({ example: 'Repeated misuse of the access request flow' })
  @IsString()
  @MinLength(5)
  reason!: string;
}
