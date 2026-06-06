import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import {
  ChatSessionEntity,
  ChatMessageEntity,
  UserProfileEntity,
  StockEntity,
  MarketDataEntity,
  RecommendationEntity,
} from '@market-mind/database';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiModule } from '../ai/ai.module';
import { NewsModule } from '../news/news.module';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSessionEntity,
      ChatMessageEntity,
      UserProfileEntity,
      StockEntity,
      MarketDataEntity,
      RecommendationEntity,
    ]),
    AuthModule,
    AiModule,
    NewsModule,
    PortfolioModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
