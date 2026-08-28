import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClarificationsService } from './clarifications.service';
import {
  AskClarificationDto,
  AnswerClarificationDto,
  IssueAddendumDto,
  OpenChallengeDto,
  DecideChallengeDto,
} from './dto/clarification.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('clarifications')
@Controller()
export class ClarificationsController {
  constructor(private readonly service: ClarificationsService) {}

  // ---- clarifications ----
  @Post('tenders/:tenderId/clarifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask the authority a clarification question (bidder)' })
  ask(
    @CurrentUser() user: AuthUser,
    @Param('tenderId') tenderId: string,
    @Body() dto: AskClarificationDto,
  ) {
    return this.service.ask(user, tenderId, dto);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('tenders/:tenderId/clarifications')
  @ApiOperation({ summary: 'Q&A — published answers are visible to all bidders' })
  list(@Param('tenderId') tenderId: string, @CurrentUser() user?: AuthUser) {
    return this.service.listQuestions(tenderId, user);
  }

  @Post('clarifications/:id/answer')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Answer a question — published to ALL bidders (authority)' })
  answer(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AnswerClarificationDto,
  ) {
    return this.service.answer(user, id, dto);
  }

  // ---- addenda ----
  @Post('tenders/:tenderId/addenda')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a numbered addendum amending the tender (authority)' })
  issueAddendum(
    @CurrentUser() user: AuthUser,
    @Param('tenderId') tenderId: string,
    @Body() dto: IssueAddendumDto,
  ) {
    return this.service.issueAddendum(user, tenderId, dto);
  }

  @Public()
  @Get('tenders/:tenderId/addenda')
  @ApiOperation({ summary: 'Addenda for a tender (public — all bidders see the same terms)' })
  listAddenda(@Param('tenderId') tenderId: string) {
    return this.service.listAddenda(tenderId);
  }

  // ---- swiss challenge ----
  @Post('tenders/:tenderId/challenge')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open a Swiss Challenge on an unsolicited proposal (authority)' })
  openChallenge(
    @CurrentUser() user: AuthUser,
    @Param('tenderId') tenderId: string,
    @Body() dto: OpenChallengeDto,
  ) {
    return this.service.openChallenge(user, tenderId, dto);
  }

  @Public()
  @Get('tenders/:tenderId/challenge')
  @ApiOperation({ summary: 'Swiss Challenge status and window' })
  getChallenge(@Param('tenderId') tenderId: string) {
    return this.service.getChallenge(tenderId);
  }

  @Post('tenders/:tenderId/challenge/decide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decide the challenge once the window closes (authority)' })
  @ApiBearerAuth()
  decideChallenge(
    @CurrentUser() user: AuthUser,
    @Param('tenderId') tenderId: string,
    @Body() dto: DecideChallengeDto,
  ) {
    return this.service.decideChallenge(user, tenderId, dto);
  }
}
