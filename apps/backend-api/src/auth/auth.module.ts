import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserProfileEntity } from '@market-mind/database';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfileEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
