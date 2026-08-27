import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { countrySummaries, findCountry } from '../../common/reference/country-intelligence';

@ApiTags('countries')
@Controller('countries')
export class CountriesController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Country intelligence index (public)' })
  list() {
    return countrySummaries();
  }

  @Public()
  @Get(':code')
  @ApiOperation({ summary: 'Country intelligence detail (public)' })
  getOne(@Param('code') code: string) {
    const country = findCountry(code);
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }
}
