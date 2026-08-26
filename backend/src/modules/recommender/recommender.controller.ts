import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecommenderService } from './recommender.service';
import { RecommendDto } from './dto/recommend.dto';

@ApiTags('recommender')
@ApiBearerAuth()
@Controller('recommender')
export class RecommenderController {
  constructor(private readonly service: RecommenderService) {}

  @Post('structures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rank JV/PPP structures for an opportunity profile (explainable)' })
  recommend(@Body() dto: RecommendDto) {
    return this.service.recommend(dto);
  }
}
