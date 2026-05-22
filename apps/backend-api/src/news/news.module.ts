import { Module } from '@nestjs/common';
import { NetworkModule } from '../network/network.module';
import { AlphaVantageService } from './alpha-vantage.service';
import { NewsApiService } from './news-api.service';

@Module({
  imports: [NetworkModule],
  providers: [NewsApiService, AlphaVantageService],
  exports: [NewsApiService, AlphaVantageService],
})
export class NewsModule {}
