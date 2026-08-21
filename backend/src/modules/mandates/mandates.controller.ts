import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MandatesService } from './mandates.service';
import { MatchingService } from '../matching/matching.service';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { UpdateMandateDto } from './dto/update-mandate.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('mandates')
@ApiBearerAuth()
@Controller('mandates')
export class MandatesController {
  constructor(
    private readonly service: MandatesService,
    private readonly matching: MatchingService,
  ) {}

  @Post()
  @Roles(Role.DEVELOPER, Role.INVESTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a mandate (developer/investor demand profile)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMandateDto) {
    return this.service.create(user, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: "The current user's mandates" })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mandate (owner or admin)' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOne(user, id);
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Explainable Fit Score matches for this mandate' })
  async matches(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const mandate = await this.service.getOwnedEntity(user, id);
    return this.matching.matchesForMandate(mandate, limit ? Number(limit) : 20);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a mandate (owner or admin)' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateMandateDto) {
    return this.service.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mandate (owner or admin)' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user, id);
  }
}
