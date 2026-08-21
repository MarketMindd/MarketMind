import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RiskTolerance, SectorInterest } from '@market-mind/common';
import { UserProfileEntity } from '@market-mind/database';
import { PortfolioService } from '../portfolio/portfolio.service';
import { ProfileService } from './profile.service';

const makeUser = (overrides: Partial<UserProfileEntity> = {}): UserProfileEntity => ({
  id: 'user-1',
  email: 'alice@example.com',
  fullName: 'Alice Smith',
  password: 'hashed',
  riskTolerance: RiskTolerance.MEDIUM,
  interests: [SectorInterest.TECHNOLOGY],
  emailNotifications: true,
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  aiSummaryCache: null,
  aiSummaryCachedAt: null,
  ...overrides,
});

describe('ProfileService', () => {
  let service: ProfileService;
  let usersRepo: { findOneByOrFail: jest.Mock; save: jest.Mock };
  let portfolioService: { clearUserSummaryCache: jest.Mock };

  beforeEach(async () => {
    usersRepo = {
      findOneByOrFail: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    portfolioService = { clearUserSummaryCache: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(UserProfileEntity), useValue: usersRepo },
        { provide: PortfolioService, useValue: portfolioService },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  describe('getProfile', () => {
    it('returns profile fields without password or refreshTokens', async () => {
      const user = makeUser();
      usersRepo.findOneByOrFail.mockResolvedValue(user);

      const result = await service.getProfile('user-1');

      expect(result).toEqual({
        fullName: 'Alice Smith',
        email: 'alice@example.com',
        riskTolerance: RiskTolerance.MEDIUM,
        interests: [SectorInterest.TECHNOLOGY],
        emailNotifications: true,
      });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshTokens');
    });
  });

  describe('updateProfile', () => {
    it('updates fullName when provided', async () => {
      const user = makeUser();
      usersRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateProfile('user-1', { fullName: 'Bob Jones' });

      expect(user.fullName).toBe('Bob Jones');
      expect(usersRepo.save).toHaveBeenCalledWith(user);
    });

    it('updates emailNotifications to false when provided', async () => {
      const user = makeUser({ emailNotifications: true });
      usersRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateProfile('user-1', { emailNotifications: false });

      expect(user.emailNotifications).toBe(false);
      expect(usersRepo.save).toHaveBeenCalledWith(user);
    });

    it('does not touch existing fields when payload is empty', async () => {
      const user = makeUser();
      usersRepo.findOneByOrFail.mockResolvedValue(user);

      await service.updateProfile('user-1', {});

      expect(user.fullName).toBe('Alice Smith');
      expect(user.riskTolerance).toBe(RiskTolerance.MEDIUM);
      expect(user.emailNotifications).toBe(true);
      expect(usersRepo.save).toHaveBeenCalledWith(user);
    });

    it('clears the cached AI summary so it regenerates against the new profile', async () => {
      usersRepo.findOneByOrFail.mockResolvedValue(makeUser());

      await service.updateProfile('user-1', { riskTolerance: RiskTolerance.HIGH });

      expect(portfolioService.clearUserSummaryCache).toHaveBeenCalledWith('user-1');
    });
  });
});
