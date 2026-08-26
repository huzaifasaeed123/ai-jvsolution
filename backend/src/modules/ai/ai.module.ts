import { Global, Module } from '@nestjs/common';
import { ExplainerService } from './explainer.service';

@Global()
@Module({
  providers: [ExplainerService],
  exports: [ExplainerService],
})
export class AiModule {}
