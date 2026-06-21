import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { GetProfileResponse, UpdateProfilePayload } from '@market-mind/common';
import { UserProfileEntity } from '@market-mind/database';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly usersRepo: Repository<UserProfileEntity>,
  ) {}

  async getProfile(userId: string): Promise<GetProfileResponse> {
    const user = await this.usersRepo.findOneByOrFail({ id: userId });
    return {
      fullName: user.fullName,
      email: user.email,
      riskTolerance: user.riskTolerance,
      interests: user.interests,
      emailNotifications: user.emailNotifications,
    };
  }

  async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<void> {
    const user = await this.usersRepo.findOneByOrFail({ id: userId });

    if (payload.fullName !== undefined) user.fullName = payload.fullName;
    if (payload.riskTolerance !== undefined) user.riskTolerance = payload.riskTolerance;
    if (payload.interests !== undefined) user.interests = payload.interests;
    if (payload.emailNotifications !== undefined) user.emailNotifications = payload.emailNotifications;

    await this.usersRepo.save(user);
  }
}
