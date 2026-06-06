import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationEntity } from '@market-mind/database';
import { NotificationModule } from '../notification/notification.module';
import { ProcessingService } from './processing.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecommendationEntity]), NotificationModule],
  providers: [ProcessingService],
  exports: [ProcessingService],
})
export class ProcessingModule {}
