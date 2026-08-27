import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { OPPORTUNITY_REFERENCE } from '../../common/reference/opportunity-reference';
import { DUE_DILIGENCE_REFERENCE } from '../../common/reference/duediligence-categories';
import { VERIFICATION_REFERENCE } from '../../common/reference/verification-reference';
import { ESTIMATE_REFERENCE } from '../../common/reference/estimate-reference';
import { CONSORTIUM_REFERENCE } from '../../common/reference/consortium-roles';

@ApiTags('reference')
@Controller('reference')
export class ReferenceController {
  @Public()
  @Get('opportunities')
  @ApiOperation({ summary: 'Reference lists for opportunity forms/filters (sectors, structures, etc.)' })
  opportunities() {
    return OPPORTUNITY_REFERENCE;
  }

  @Public()
  @Get('due-diligence')
  @ApiOperation({ summary: 'Reference lists for due diligence (categories, risk ratings, statuses)' })
  dueDiligence() {
    return DUE_DILIGENCE_REFERENCE;
  }

  @Public()
  @Get('verification')
  @ApiOperation({ summary: 'Reference lists for verification (tiers, verifiable fields)' })
  verification() {
    return VERIFICATION_REFERENCE;
  }

  @Public()
  @Get('estimate')
  @ApiOperation({ summary: 'Reference lists for cost estimate (spec levels, unit bases, elements)' })
  estimate() {
    return ESTIMATE_REFERENCE;
  }

  @Public()
  @Get('consortium')
  @ApiOperation({ summary: 'Reference lists for consortiums (member roles)' })
  consortium() {
    return CONSORTIUM_REFERENCE;
  }
}
