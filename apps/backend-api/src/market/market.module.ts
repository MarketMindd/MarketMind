import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataEntity, PortfolioEntity } from '@market-mind/database';
import { MarketService } from './market.service.js';
import { PipelineModule } from '../pipeline/pipeline.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortfolioEntity, MarketDataEntity]),
    PipelineModule,
  ],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
