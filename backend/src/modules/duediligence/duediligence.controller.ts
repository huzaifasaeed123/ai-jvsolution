import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DueDiligenceService } from './duediligence.service';
import { CreateDueDiligenceItemDto } from './dto/create-item.dto';
import { UpdateDueDiligenceItemDto } from './dto/update-item.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('due-diligence')
@Controller()
export class DueDiligenceController {
  constructor(private readonly service: DueDiligenceService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('opportunities/:opportunityId/due-diligence')
  @ApiOperation({ summary: 'Due diligence checklist (owner/admin or access-granted users)' })
  list(@Param('opportunityId') opportunityId: string, @CurrentUser() user?: AuthUser) {
    return this.service.list(user, opportunityId);
  }

  @Post('opportunities/:opportunityId/due-diligence')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a due diligence item (owner)' })
  create(
    @CurrentUser() user: AuthUser,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: CreateDueDiligenceItemDto,
  ) {
    return this.service.create(user, opportunityId, dto);
  }

  @Post('opportunities/:opportunityId/due-diligence/seed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed a starter checklist across standard categories (owner)' })
  seed(@CurrentUser() user: AuthUser, @Param('opportunityId') opportunityId: string) {
    return this.service.seed(user, opportunityId);
  }

  @Patch('due-diligence/:itemId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a due diligence item (owner)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateDueDiligenceItemDto,
  ) {
    return this.service.update(user, itemId, dto);
  }

  @Delete('due-diligence/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a due diligence item (owner)' })
  remove(@CurrentUser() user: AuthUser, @Param('itemId') itemId: string) {
    return this.service.remove(user, itemId);
  }
}
