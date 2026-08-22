import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { OPPORTUNITY_REFERENCE } from '../../common/reference/opportunity-reference';
import { DUE_DILIGENCE_REFERENCE } from '../../common/reference/duediligence-categories';

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
}
