import { Injectable } from '@nestjs/common';
import { ExplainerService } from '../ai/explainer.service';
import { recommendStructures, RecommenderInputs } from './structure-recommender';
import { RecommendDto } from './dto/recommend.dto';

@Injectable()
export class RecommenderService {
  constructor(private readonly explainer: ExplainerService) {}

  recommend(dto: RecommendDto) {
    const result = recommendStructures(dto as unknown as RecommenderInputs);
    return {
      ...result,
      explanation: this.explainer.explainRecommendation(result),
    };
  }
}
