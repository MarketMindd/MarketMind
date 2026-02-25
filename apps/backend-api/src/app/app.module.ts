import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmOptions } from '@market-mind/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortfoliosModule } from './portfolios/portfolios.module';

@Module({
  imports: [TypeOrmModule.forRoot(createTypeOrmOptions()), PortfoliosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
