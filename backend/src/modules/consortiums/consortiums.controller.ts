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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ConsortiumsService } from './consortiums.service';
import { CreateConsortiumDto, InviteMemberDto, UpdateMemberDto } from './dto/consortium.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('consortiums')
@ApiBearerAuth()
@Controller()
export class ConsortiumsController {
  constructor(private readonly service: ConsortiumsService) {}

  @Post('consortiums')
  @Roles(Role.DEVELOPER, Role.INVESTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a consortium (creator becomes the lead)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateConsortiumDto) {
    return this.service.create(user, dto);
  }

  @Get('consortiums/mine')
  @ApiOperation({ summary: 'Consortiums I lead or belong to' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get('consortiums/:id')
  @ApiOperation({ summary: 'Consortium detail (lead or member)' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOne(user, id);
  }

  @Post('consortiums/:id/members')
  @ApiOperation({ summary: 'Invite a registered user (lead)' })
  invite(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: InviteMemberDto) {
    return this.service.invite(user, id, dto);
  }

  @Patch('consortiums/:id/members/:memberId')
  @ApiOperation({ summary: 'Update a member role/equity (lead)' })
  updateMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.service.updateMember(user, id, memberId, dto);
  }

  @Delete('consortiums/:id/members/:memberId')
  @ApiOperation({ summary: 'Remove a member (lead)' })
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.service.removeMember(user, id, memberId);
  }

  @Post('consortium-members/:memberId/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a consortium invitation (invited user)' })
  accept(@CurrentUser() user: AuthUser, @Param('memberId') memberId: string) {
    return this.service.respond(user, memberId, true);
  }

  @Post('consortium-members/:memberId/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decline a consortium invitation (invited user)' })
  decline(@CurrentUser() user: AuthUser, @Param('memberId') memberId: string) {
    return this.service.respond(user, memberId, false);
  }

  @Post('consortiums/:id/disband')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disband a consortium (lead)' })
  disband(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.disband(user, id);
  }
}
