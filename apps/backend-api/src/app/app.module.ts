import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDataSourceOptions } from '@market-mind/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(createDataSourceOptions()),
    ScheduleModule.forRoot(),
    AuthModule,
    MarketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
