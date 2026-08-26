import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ValuationService } from './valuation.service';
import { ComputeValuationDto, SaveValuationDto } from './dto/compute-valuation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('valuation')
@ApiBearerAuth()
@Controller('valuation')
export class ValuationController {
  constructor(private readonly service: ValuationService) {}

  @Post('compute')
  @ApiOperation({ summary: 'Compute a valuation (residual/comparable/income/dcf) + explanation' })
  compute(@Body() dto: ComputeValuationDto) {
    return this.service.compute(dto.method, dto.inputs);
  }

  @Post()
  @ApiOperation({ summary: 'Compute and save a valuation run (stores method + inputs + outputs)' })
  save(@CurrentUser() user: AuthUser, @Body() dto: SaveValuationDto) {
    return this.service.save(user, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'My saved valuation runs' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved run (creator or admin)' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOne(user, id);
  }
}
