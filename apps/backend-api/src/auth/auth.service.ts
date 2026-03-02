import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileEntity } from '@market-mind/database';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly usersRepo: Repository<UserProfileEntity>,
  ) {}

  async signup(email: string, password: string, fullName = '') {
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      email,
      password: hashed,
      fullName,
    });

    return this.usersRepo.save(user);
  }

  async signin(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new NotFoundException('Invalid credentials');
    }

    // For now return basic profile (do not include password)
    const { password: _p, ...profile } = user;
    return profile;
  }
}
