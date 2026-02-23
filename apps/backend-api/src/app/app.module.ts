import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmOptions } from '@market-mind/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TypeOrmModule.forRoot(createTypeOrmOptions())],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
