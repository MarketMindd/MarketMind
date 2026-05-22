import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PortfolioEntity,
  RecommendationEntity,
  SymbolFilterStateEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { NewsModule } from '../news/news.module';
import { FilterService } from './filter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SymbolFilterStateEntity,
      PortfolioEntity,
      UserProfileEntity,
      RecommendationEntity,
    ]),
    NewsModule,
  ],
  providers: [FilterService],
  exports: [FilterService],
})
export class FilterModule {}
