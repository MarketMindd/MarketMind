import { Module } from '@nestjs/common';
import { FilterModule } from '../filter/filter.module.js';
import { AiModule } from '../ai/ai.module.js';
import { PipelineService } from './pipeline.service.js';

@Module({
  imports: [FilterModule, AiModule],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
