import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { AdminUsersService } from './admin-users.service';
import { AdminContentService } from './admin-content.service';
import { AdminOversightService } from './admin-oversight.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { SetRoleDto, SetAccessLevelDto, ReasonDto } from './dto/admin-actions.dto';
import { QueryOpportunitiesDto, QueryTendersDto } from './dto/query-content.dto';
import {
  QueryAuditDto,
  QueryAccessRequestsDto,
  PruneAuditDto,
} from './dto/query-audit.dto';

/**
 * Platform back-office. @Roles is applied at the class level so a route added
 * here cannot accidentally ship without the admin gate.
 */
@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly users: AdminUsersService,
    private readonly content: AdminContentService,
    private readonly oversight: AdminOversightService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Headline platform counts' })
  async overview() {
    const [users, content, engines, accessRequests] = await Promise.all([
      this.users.overview(),
      this.content.counts(),
      this.oversight.engineRuns(),
      this.oversight.accessRequestCounts(),
    ]);
    return { users, ...content, engines, accessRequests };
  }

  @Get('users')
  @ApiOperation({ summary: 'Search and filter the user directory' })
  listUsers(@Query() query: QueryUsersDto) {
    return this.users.list(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get one user' })
  getUser(@Param('id') id: string) {
    return this.users.get(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change a user role' })
  setRole(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.users.setRole(actor, id, dto.role);
  }

  @Patch('users/:id/access-level')
  @ApiOperation({ summary: 'Change a user access level' })
  setAccessLevel(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: SetAccessLevelDto,
  ) {
    return this.users.setAccessLevel(actor, id, dto.accessLevel);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend an account (revokes its sessions)' })
  suspend(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() dto: ReasonDto) {
    return this.users.suspend(actor, id, dto.reason);
  }

  @Post('users/:id/reinstate')
  @ApiOperation({ summary: 'Lift a suspension' })
  reinstate(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.users.reinstate(actor, id);
  }

  @Post('users/:id/sign-out')
  @ApiOperation({ summary: 'Revoke every session for a user' })
  signOut(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.users.forceSignOut(actor, id);
  }

  @Post('users/:id/delete')
  @ApiOperation({ summary: 'Soft-delete an account, preserving its audit trail' })
  softDelete(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() dto: ReasonDto) {
    return this.users.softDelete(actor, id, dto.reason);
  }

  // ------------------------------------------------------------- moderation

  @Get('opportunities')
  @ApiOperation({ summary: 'Every listing, including drafts and archived' })
  listOpportunities(@Query() query: QueryOpportunitiesDto) {
    return this.content.listOpportunities(query);
  }

  @Get('opportunities/:id')
  @ApiOperation({ summary: 'One listing, whatever its status' })
  getOpportunity(@Param('id') id: string) {
    return this.content.getOpportunity(id);
  }

  @Post('opportunities/:id/unpublish')
  @ApiOperation({ summary: 'Take a listing off the market, back to draft' })
  unpublish(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() dto: ReasonDto) {
    return this.content.unpublish(actor, id, dto.reason);
  }

  @Post('opportunities/:id/archive')
  @ApiOperation({ summary: 'Retire a listing' })
  archive(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() dto: ReasonDto) {
    return this.content.archive(actor, id, dto.reason);
  }

  @Post('opportunities/:id/restore')
  @ApiOperation({ summary: 'Undo a takedown — returns the listing to draft' })
  restore(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.content.restore(actor, id);
  }

  @Get('verification-queue')
  @ApiOperation({ summary: 'Listings awaiting or needing verification review' })
  verificationQueue() {
    return this.content.verificationQueue();
  }

  @Get('tenders')
  @ApiOperation({ summary: 'Every tender, with stalled procurements flagged' })
  listTenders(@Query() query: QueryTendersDto) {
    return this.content.listTenders(query);
  }

  // -------------------------------------------------------------- oversight

  @Get('audit')
  @ApiOperation({ summary: 'Activity trail, filtered by actor, action, target or date' })
  auditTrail(@Query() query: QueryAuditDto) {
    return this.oversight.auditTrail(query);
  }

  @Get('audit/actions')
  @ApiOperation({ summary: 'Distinct actions present in the trail, with counts' })
  auditActions() {
    return this.oversight.auditActions();
  }

  @Post('audit/prune')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete trail entries older than N days (retention)' })
  pruneAudit(@Body() dto: PruneAuditDto) {
    return this.oversight.pruneAudit(dto.days);
  }

  @Get('metrics/growth')
  @ApiOperation({ summary: 'Monthly signup and listing growth' })
  growth() {
    return this.oversight.growth();
  }

  @Get('access-requests')
  @ApiOperation({ summary: 'Access requests platform-wide, with time pending' })
  accessRequests(@Query() query: QueryAccessRequestsDto) {
    return this.oversight.accessRequests(query.status, query.page, query.limit);
  }
}
