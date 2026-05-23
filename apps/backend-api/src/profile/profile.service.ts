import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UpdateProfilePayload } from '@market-mind/common';
import { UserProfileEntity } from '@market-mind/database';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly usersRepo: Repository<UserProfileEntity>,
  ) {}

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<void> {
    const user = await this.usersRepo.findOneByOrFail({ id: userId });

    if (payload.riskTolerance !== undefined) {
      user.riskTolerance = payload.riskTolerance;
    }

    if (payload.interests !== undefined) {
      user.interests = payload.interests;
    }

    await this.usersRepo.save(user);
  }
}
