import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { FilterModule } from '../filter/filter.module';
import { ProcessingModule } from '../processing/processing.module';
import { PipelineService } from './pipeline.service';

@Module({
  imports: [FilterModule, AiModule, ProcessingModule],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
