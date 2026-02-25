import {
  PortfolioEntity,
  PortfolioHoldingEntity,
} from '@market-mind/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentUserService } from './current-user.service';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, PortfolioHoldingEntity])],
  controllers: [PortfoliosController],
  providers: [PortfoliosService, CurrentUserService],
})
export class PortfoliosModule {}
