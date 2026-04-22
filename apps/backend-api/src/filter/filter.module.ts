import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PortfolioEntity,
  RecommendationEntity,
  SymbolFilterStateEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { FilterService } from './filter.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SymbolFilterStateEntity,
      PortfolioEntity,
      UserProfileEntity,
      RecommendationEntity,
    ]),
  ],
  providers: [FilterService],
  exports: [FilterService],
})
export class FilterModule {}
