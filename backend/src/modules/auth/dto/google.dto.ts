import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class GoogleCallbackDto {
  @ApiProperty({ description: 'One-time authorization code from Google' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class RedeemDto {
  @ApiProperty({ description: 'Single-use handle issued by the callback' })
  @IsString()
  @IsNotEmpty()
  handle!: string;
}

/** Role chosen during onboarding by a user who signed up through Google. */
export class ConfirmRoleDto {
  @ApiProperty({ enum: Role, example: Role.OWNER })
  @IsEnum(Role)
  role!: Role;
}
