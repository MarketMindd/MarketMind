import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createDataSourceOptions } from '@market-mind/database';

import { AuthModule } from '../auth/auth.module';
import { MarketModule } from '../market/market.module';
import { StockModule } from '../stock/stock.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(createDataSourceOptions()),
    ScheduleModule.forRoot(),
    AuthModule,
    MarketModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
