import {
  AuthResponse,
  SignInPayload,
  SignUpPayload,
  UserProfile,
} from '@market-mind/common';
import { UserProfileEntity } from '@market-mind/database';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly usersRepo: Repository<UserProfileEntity>,
    private readonly jwtService: JwtService,
  ) {}

  private createAuthResponse(profile: UserProfile): AuthResponse {
    const accessToken = this.jwtService.sign(profile);
    return { accessToken, user: profile };
  }

  async signup(
    email: SignUpPayload['email'],
    password: SignUpPayload['password'],
    fullName: SignUpPayload['fullName'],
  ) {
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

    const saved = await this.usersRepo.save(user);
    const { password: _p, createdAt, updatedAt, ...profile } = saved;
    return this.createAuthResponse(profile);
  }

  async signin(
    email: SignInPayload['email'],
    password: SignInPayload['password'],
  ): Promise<AuthResponse> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _p, createdAt, updatedAt, ...profile } = user;
    return this.createAuthResponse(profile);
  }
}
