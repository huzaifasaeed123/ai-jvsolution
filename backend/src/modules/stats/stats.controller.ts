import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Live public platform statistics (counted from the database)' })
  publicStats() {
    return this.service.publicStats();
  }
}
