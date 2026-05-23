import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioEntity, StockEntity, UserProfileEntity } from '@market-mind/database';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, StockEntity, UserProfileEntity]), AiModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
