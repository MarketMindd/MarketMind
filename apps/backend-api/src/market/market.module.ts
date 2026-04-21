import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataEntity, PortfolioEntity } from '@market-mind/database';
import { MarketService } from './market.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, MarketDataEntity])],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
