import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import {
  AuthResponse,
  RiskTolerance,
  SignInPayload,
  SignUpPayload,
  UserProfile,
} from '@market-mind/common';
import { UserProfileEntity } from '@market-mind/database';
import { appConfig } from '../config/appConfig';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly usersRepo: Repository<UserProfileEntity>,
    private readonly jwtService: JwtService,
  ) {}

  private createAuthResponse(profile: UserProfile, userId: string): AuthResponse {
    const accessToken = this.jwtService.sign(profile);
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { secret: appConfig.jwt.refreshSecret, expiresIn: appConfig.jwt.refreshExpiresIn },
    );
    return { accessToken, refreshToken, user: profile };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (user) {
      const tokens = user.refreshTokens || [];
      tokens.push(refreshToken);
      // Keep only the last maxActiveSessions tokens for multi-device support
      if (tokens.length > appConfig.auth.maxActiveSessions) {
        tokens.splice(0, tokens.length - appConfig.auth.maxActiveSessions);
      }
      user.refreshTokens = tokens;
      await this.usersRepo.save(user);
    }
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
      riskTolerance: RiskTolerance.MEDIUM,
    });

    const saved = await this.usersRepo.save(user);
    const {
      password: _p,
      refreshTokens: _r,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...profile
    } = saved;
    const response = this.createAuthResponse(profile, saved.id);
    await this.saveRefreshToken(saved.id, response.refreshToken);
    return response;
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

    const {
      password: _p,
      refreshTokens: _r,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...profile
    } = user;
    const response = this.createAuthResponse(profile, user.id);
    await this.saveRefreshToken(user.id, response.refreshToken);
    return response;
  }

  async googleSignin(credential: string): Promise<AuthResponse> {
    const client = new OAuth2Client(appConfig.auth.googleClientId);

    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: appConfig.auth.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const email = payload.email;
      let user = await this.usersRepo.findOne({ where: { email } });

      if (!user) {
        const randomPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
          10,
        );
        const newUser = this.usersRepo.create({
          email,
          fullName: payload.name || email.split('@')[0],
          password: randomPassword,
        });
        user = await this.usersRepo.save(newUser);
      }

      const {
        password: _p,
        refreshTokens: _r,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...profile
      } = user;
      const response = this.createAuthResponse(profile, user.id);
      await this.saveRefreshToken(user.id, response.refreshToken);
      return response;
    } catch {
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (user && user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await this.usersRepo.save(user);
    }
  }

  async refreshTokens(oldRefreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: appConfig.jwt.refreshSecret,
      });
      const userId = payload.sub;

      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const hasToken = user.refreshTokens && user.refreshTokens.includes(oldRefreshToken);

      // Reuse detection
      if (!hasToken) {
        // Token is valid but not in the list. This means it was used before or revoked.
        // Invalidate ALL tokens for this user to prevent abuse.
        user.refreshTokens = [];
        await this.usersRepo.save(user);
        throw new UnauthorizedException(
          'Security alert: Token reuse detected. All sessions invalidated.',
        );
      }

      // Remove the old token from the array
      user.refreshTokens = user.refreshTokens.filter((t) => t !== oldRefreshToken);

      const {
        password: _p,
        refreshTokens: _r,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...profile
      } = user;
      const response = this.createAuthResponse(profile, user.id);

      // Save new token
      user.refreshTokens.push(response.refreshToken);
      if (user.refreshTokens.length > appConfig.auth.maxActiveSessions) {
        user.refreshTokens.splice(0, user.refreshTokens.length - appConfig.auth.maxActiveSessions);
      }

      await this.usersRepo.save(user);
      return response;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
