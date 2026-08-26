import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EstimateService } from './estimate.service';
import { ComputeEstimateDto, SaveEstimateDto } from './dto/compute-estimate.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('estimate')
@ApiBearerAuth()
@Controller('estimate')
export class EstimateController {
  constructor(private readonly service: EstimateService) {}

  @Post('compute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compute a cost estimate (stateless) + explanation' })
  compute(@Body() dto: ComputeEstimateDto) {
    return this.service.compute(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Compute and save an estimate run' })
  save(@CurrentUser() user: AuthUser, @Body() dto: SaveEstimateDto) {
    return this.service.save(user, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'My saved estimate runs' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved run (creator or admin)' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOne(user, id);
  }
}
