import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { OPPORTUNITY_REFERENCE } from '../../common/reference/opportunity-reference';

@ApiTags('reference')
@Controller('reference')
export class ReferenceController {
  @Public()
  @Get('opportunities')
  @ApiOperation({ summary: 'Reference lists for opportunity forms/filters (sectors, structures, etc.)' })
  opportunities() {
    return OPPORTUNITY_REFERENCE;
  }
}
