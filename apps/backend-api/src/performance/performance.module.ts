import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataEntity, RecommendationHistoryEntity, StockEntity } from '@market-mind/database';
import { AuthModule } from '../auth/auth.module';
import { PerformanceRefreshService } from './performance-refresh.service';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecommendationHistoryEntity, StockEntity, MarketDataEntity]),
    AuthModule,
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService, PerformanceRefreshService],
})
export class PerformanceModule {}
