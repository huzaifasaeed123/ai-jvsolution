import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { SetVerificationDto } from './dto/set-verification.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Post()
  @Roles(Role.OWNER, Role.GOVERNMENT, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an opportunity (starts as DRAFT)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOpportunityDto) {
    return this.service.create(user, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse published opportunities (filtered, paginated) — confidential fields hidden' })
  list(@Query() query: QueryOpportunityDto) {
    return this.service.list(query);
  }

  @Get('mine')
  @ApiBearerAuth()
  @ApiOperation({ summary: "The current user's own opportunities (any status)" })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Opportunity detail — confidential fields only for owner/admin' })
  getOne(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.service.getOne(id, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an opportunity (owner or admin)' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.service.update(user, id, dto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a draft opportunity (owner or admin)' })
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.publish(user, id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete an opportunity (owner or admin)' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user, id);
  }

  @Patch(':id/verification')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set Opportunity Passport verification tier (admin)' })
  setVerification(@Param('id') id: string, @Body() dto: SetVerificationDto) {
    return this.service.setVerification(id, dto.tier);
  }
}
