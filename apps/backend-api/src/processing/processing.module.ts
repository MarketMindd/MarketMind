import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MarketDataEntity,
  RecommendationEntity,
  RecommendationHistoryEntity,
} from '@market-mind/database';
import { NotificationModule } from '../notification/notification.module';
import { ProcessingService } from './processing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecommendationEntity,
      RecommendationHistoryEntity,
      MarketDataEntity,
    ]),
    NotificationModule,
  ],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}
