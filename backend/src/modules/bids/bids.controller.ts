import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { BidsService } from './bids.service';
import { CreateBidDto, UpdateBidDto, DisqualifyBidDto } from './dto/bid.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('bids')
@ApiBearerAuth()
@Controller()
export class BidsController {
  constructor(private readonly service: BidsService) {}

  @Post('tenders/:tenderId/bids')
  @Roles(Role.DEVELOPER, Role.INVESTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Start a bid on an open tender (one per bidder)' })
  create(
    @CurrentUser() user: AuthUser,
    @Param('tenderId') tenderId: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.service.create(user, tenderId, dto);
  }

  @Get('tenders/:tenderId/bids')
  @ApiOperation({ summary: 'Bids received (authority) — SEALED until the submission deadline' })
  listForTender(@CurrentUser() user: AuthUser, @Param('tenderId') tenderId: string) {
    return this.service.listForTender(user, tenderId);
  }

  @Get('bids/mine')
  @ApiOperation({ summary: 'My bids' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get('bids/:id')
  @ApiOperation({ summary: 'Bid detail (bidder always; authority sealed until deadline)' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOne(user, id);
  }

  @Patch('bids/:id')
  @ApiOperation({ summary: 'Edit my bid (before the deadline)' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateBidDto) {
    return this.service.update(user, id, dto);
  }

  @Post('bids/:id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seal and submit my bid (requires bid security + checklist)' })
  submit(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.submit(user, id);
  }

  @Post('bids/:id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw my bid (before the deadline only)' })
  withdraw(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.withdraw(user, id);
  }

  @Post('bids/:id/disqualify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disqualify a bid for failing a mandatory requirement (authority)' })
  disqualify(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: DisqualifyBidDto,
  ) {
    return this.service.disqualify(user, id, dto.reason);
  }
}
