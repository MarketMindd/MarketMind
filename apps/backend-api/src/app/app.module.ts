import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDataSourceOptions } from '@market-mind/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(createDataSourceOptions()), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
