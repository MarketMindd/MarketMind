import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketDataEntity, PortfolioEntity } from '@market-mind/database';

import { PipelineModule } from '../pipeline/pipeline.module';
import { MarketService } from './market.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, MarketDataEntity]), PipelineModule],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
