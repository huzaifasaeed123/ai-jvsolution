import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeasibilityService } from './feasibility.service';
import { ComputeFeasibilityDto, SaveFeasibilityDto } from './dto/compute-feasibility.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('feasibility')
@ApiBearerAuth()
@Controller('feasibility')
export class FeasibilityController {
  constructor(private readonly service: FeasibilityService) {}

  @Post('compute')
  @ApiOperation({ summary: 'Compute a feasibility model (stateless) + plain-language explanation' })
  compute(@Body() dto: ComputeFeasibilityDto) {
    return this.service.compute(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Compute and save a feasibility run (stores inputs + version + assumptions)' })
  save(@CurrentUser() user: AuthUser, @Body() dto: SaveFeasibilityDto) {
    return this.service.save(user, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'My saved feasibility runs' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.listMine(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved run (creator or admin)' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getOne(user, id);
  }
}
