import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataEntity, StockEntity } from '@market-mind/database';
import { PipelineModule } from '../pipeline/pipeline.module';
import { MarketService } from './market.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockEntity, MarketDataEntity]), PipelineModule],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
