import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from '@market-mind/database';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfileEntity])],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
