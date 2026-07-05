import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDataSourceOptions } from '@market-mind/database';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { MarketModule } from '../market/market.module';
import { PerformanceModule } from '../performance/performance.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ProfileModule } from '../profile/profile.module';
import { StockModule } from '../stock/stock.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(createDataSourceOptions()),
    ScheduleModule.forRoot(),
    AuthModule,
    MarketModule,
    PortfolioModule,
    ProfileModule,
    StockModule,
    ChatModule,
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
