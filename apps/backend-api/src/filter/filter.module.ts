import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioEntity, SymbolFilterStateEntity, UserProfileEntity } from '@market-mind/database';
import { FilterService } from './filter.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([SymbolFilterStateEntity, PortfolioEntity, UserProfileEntity])],
  providers: [FilterService],
  exports: [FilterService],
})
export class FilterModule {}
