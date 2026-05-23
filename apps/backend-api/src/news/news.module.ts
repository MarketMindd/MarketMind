import { Module } from '@nestjs/common';
import { NetworkModule } from '../network/network.module';
import { AlphaVantageService } from './alpha-vantage.service';
import { MassiveApiService } from './massive.service';
import { NewsApiService } from './news-api.service';

@Module({
  imports: [NetworkModule],
  providers: [NewsApiService, AlphaVantageService, MassiveApiService],
  exports: [NewsApiService, AlphaVantageService, MassiveApiService],
})
export class NewsModule {}
