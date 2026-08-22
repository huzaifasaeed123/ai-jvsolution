import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Target folder id' })
  @IsString()
  @MinLength(1)
  folderId!: string;

  @ApiPropertyOptional({ enum: AccessLevel, description: 'Override the folder access level' })
  @IsOptional()
  @IsEnum(AccessLevel)
  minAccessLevel?: AccessLevel;
}
