import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { VerificationService } from './verification.service';
import { SetVerificationDto } from './dto/set-verification.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('verification')
@Controller('opportunities/:opportunityId/verification')
export class VerificationController {
  constructor(private readonly service: VerificationService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Opportunity Passport: tier, verified fields, unresolved items' })
  get(@Param('opportunityId') opportunityId: string, @CurrentUser() user?: AuthUser) {
    return this.service.get(opportunityId, user);
  }

  @Put()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set verification tier + verified fields + unresolved items (admin)' })
  set(
    @CurrentUser() user: AuthUser,
    @Param('opportunityId') opportunityId: string,
    @Body() dto: SetVerificationDto,
  ) {
    return this.service.set(user, opportunityId, dto);
  }
}
