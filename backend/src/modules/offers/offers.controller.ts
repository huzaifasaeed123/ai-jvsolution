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
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto, SetOfferStatusDto } from './dto/update-offer.dto';
import { CompareOffersDto } from './dto/compare-offers.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('offers')
@ApiBearerAuth()
@Controller()
export class OffersController {
  constructor(private readonly service: OffersService) {}

  @Post('opportunities/:opportunityId/offers')
  @Roles(Role.DEVELOPER, Role.INVESTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Submit an offer/EOI (requires an access grant; not the owner)' })
  submit(
    @CurrentUser() user: AuthUser,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: CreateOfferDto,
  ) {
    return this.service.submit(user, opportunityId, dto);
  }

  @Get('opportunities/:opportunityId/offers')
  @ApiOperation({ summary: 'List offers on an opportunity (owner/admin)' })
  listForOpportunity(@CurrentUser() user: AuthUser, @Param('opportunityId') opportunityId: string) {
    return this.service.listForOpportunity(user, opportunityId);
  }

  @Post('opportunities/:opportunityId/offers/compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Weighted, explainable comparison of received offers (owner/admin)' })
  compare(
    @CurrentUser() user: AuthUser,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: CompareOffersDto,
  ) {
    return this.service.compare(user, opportunityId, dto.weights);
  }

  @Get('offers/mine')
  @ApiOperation({ summary: 'Offers I submitted' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get('offers/:id')
  @ApiOperation({ summary: 'Get an offer (submitter, owner or admin)' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOne(user, id);
  }

  @Patch('offers/:id')
  @ApiOperation({ summary: 'Update my offer (while editable)' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.service.update(user, id, dto);
  }

  @Post('offers/:id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw my offer' })
  withdraw(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.withdraw(user, id);
  }

  @Patch('offers/:id/status')
  @ApiOperation({ summary: 'Set offer status — review/shortlist/accept/reject (owner/admin)' })
  setStatus(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SetOfferStatusDto) {
    return this.service.setStatus(user, id, dto.status);
  }
}
