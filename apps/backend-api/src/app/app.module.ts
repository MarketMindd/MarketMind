import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDataSourceOptions } from '@market-mind/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TypeOrmModule.forRoot(createDataSourceOptions())],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
