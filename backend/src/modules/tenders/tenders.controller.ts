import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role, TenderStage } from '@prisma/client';
import { TendersService } from './tenders.service';
import { CreateTenderDto, UpdateTenderDto, SetTenderStageDto } from './dto/tender.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('tenders')
@Controller()
export class TendersController {
  constructor(private readonly service: TendersService) {}

  @Post('opportunities/:opportunityId/tenders')
  @Roles(Role.GOVERNMENT, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tender against a government/semi-gov opportunity' })
  create(
    @CurrentUser() user: AuthUser,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: CreateTenderDto,
  ) {
    return this.service.create(user, opportunityId, dto);
  }

  @Public()
  @Get('tenders')
  @ApiOperation({ summary: 'Public tender notices (transparency — open to all)' })
  @ApiQuery({ name: 'countryCode', required: false })
  @ApiQuery({ name: 'stage', required: false, enum: TenderStage })
  listPublic(@Query('countryCode') countryCode?: string, @Query('stage') stage?: TenderStage) {
    return this.service.listPublic({ countryCode, stage });
  }

  @Get('tenders/mine')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tenders I publish as an authority' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('opportunities/:opportunityId/tenders')
  @ApiOperation({ summary: 'Tenders on an opportunity (drafts only for the authority)' })
  forOpportunity(@Param('opportunityId') opportunityId: string, @CurrentUser() user?: AuthUser) {
    return this.service.listForOpportunity(opportunityId, user);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('tenders/:id')
  @ApiOperation({ summary: 'Tender notice detail' })
  getOne(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.service.getOne(id, user);
  }

  @Patch('tenders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Amend a tender (authority, before bidding closes)' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTenderDto) {
    return this.service.update(user, id, dto);
  }

  @Patch('tenders/:id/stage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Advance the procurement stage (authority)' })
  setStage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SetTenderStageDto,
  ) {
    return this.service.setStage(user, id, dto.stage);
  }

  @Delete('tenders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a draft tender (authority)' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user, id);
  }
}
