import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IndicatorsService } from './indicators.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('indicators')
@Controller()
export class IndicatorsController {
  constructor(private readonly service: IndicatorsService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('opportunities/:opportunityId/dashboard')
  @ApiOperation({ summary: 'Investor dashboard: KPIs, readiness scores and charts (access-gated)' })
  dashboard(@Param('opportunityId') opportunityId: string, @CurrentUser() user?: AuthUser) {
    return this.service.getDashboard(user, opportunityId);
  }
}
