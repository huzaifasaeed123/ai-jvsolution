import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChallengeStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AskClarificationDto {
  @ApiProperty({ description: 'Question to the authority' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  question!: string;
}

export class AnswerClarificationDto {
  @ApiProperty({ description: 'Answer — published to ALL bidders' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  answer!: string;
}

export class IssueAddendumDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'What changed and why' })
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({ description: 'Revised submission deadline, if extended' })
  @IsOptional()
  @IsDateString()
  newSubmissionDeadline?: string;
}

export class OpenChallengeDto {
  @ApiProperty({ description: 'The party whose unsolicited proposal is being challenged' })
  @IsString()
  originatorId!: string;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(180)
  challengeWindowDays?: number;

  @ApiPropertyOptional({ default: true, description: 'Originator may match a superior counter-proposal' })
  @IsOptional()
  @IsBoolean()
  originatorMayMatch?: boolean;
}

export class DecideChallengeDto {
  @ApiProperty({ enum: [ChallengeStatus.ORIGINAL_WINS, ChallengeStatus.CHALLENGER_WINS, ChallengeStatus.CANCELLED] })
  @IsEnum(ChallengeStatus)
  status!: ChallengeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  outcomeNotes?: string;
}
