import { Module } from '@nestjs/common';
import { FilterModule } from '../filter/filter.module.js';
import { AiModule } from '../ai/ai.module.js';
import { ProcessingModule } from '../processing/processing.module.js';
import { PipelineService } from './pipeline.service.js';

@Module({
  imports: [FilterModule, AiModule, ProcessingModule],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
