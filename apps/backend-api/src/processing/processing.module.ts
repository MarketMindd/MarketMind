import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecommendationEntity } from '@market-mind/database';

import { ProcessingService } from './processing.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecommendationEntity])],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}
