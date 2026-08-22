import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccessService } from './access.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('access')
@ApiBearerAuth()
@Controller('access-requests')
export class AccessController {
  constructor(private readonly service: AccessService) {}

  @Post()
  @ApiOperation({ summary: 'Request confidential access to an opportunity' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAccessRequestDto) {
    return this.service.request(user, dto);
  }

  @Get('incoming')
  @ApiOperation({ summary: 'Access requests on opportunities I own' })
  incoming(@CurrentUser() user: AuthUser) {
    return this.service.listIncoming(user);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Access requests I have made' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get('for/:opportunityId')
  @ApiOperation({ summary: "My request status for a specific opportunity (or null)" })
  forOpportunity(@CurrentUser() user: AuthUser, @Param('opportunityId') opportunityId: string) {
    return this.service.forOpportunity(user, opportunityId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an access request (owner/admin)' })
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.decide(user, id, true);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an access request (owner/admin)' })
  reject(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.decide(user, id, false);
  }

  @Post(':id/nda')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign the NDA to unlock access (requester, after approval)' })
  signNda(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.signNda(user, id);
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a granted/pending access request (owner/admin)' })
  revoke(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.revoke(user, id);
  }
}
