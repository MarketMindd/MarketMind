import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RiskTolerance, SectorInterest } from '@market-mind/common';
import {
  MarketDataEntity,
  PortfolioEntity,
  StockEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { AiService } from '../ai/ai.service';
import { PortfolioService } from './portfolio.service';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const makeUser = (overrides: Partial<UserProfileEntity> = {}): UserProfileEntity =>
  ({
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
  }) as UserProfileEntity;

const makeCachedSummary = () => ({
  summary: 'Cached summary text',
  suggestedStocks: ['AAPL'],
  riskTolerance: RiskTolerance.MEDIUM,
  interests: [SectorInterest.TECHNOLOGY],
});

describe('PortfolioService', () => {
  let service: PortfolioService;
  const mockPortfolioRepo = {
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const mockStockRepo = { find: jest.fn() };
  const mockUserRepo = { findOne: jest.fn(), update: jest.fn() };
  const mockAiService = { generateMarketSummary: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPortfolioRepo.find.mockResolvedValue([]);
    mockPortfolioRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      distinctOn: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    });
    mockStockRepo.find.mockResolvedValue([]);
    mockUserRepo.update.mockResolvedValue(undefined);
    mockAiService.generateMarketSummary.mockResolvedValue({
      summary: 'Freshly generated summary',
      suggestedStocks: [],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: getRepositoryToken(PortfolioEntity), useValue: mockPortfolioRepo },
        { provide: getRepositoryToken(StockEntity), useValue: mockStockRepo },
        { provide: getRepositoryToken(UserProfileEntity), useValue: mockUserRepo },
        { provide: getRepositoryToken(MarketDataEntity), useValue: {} },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  it('clears the cached summary in the database, not in process memory', async () => {
    await service.clearUserSummaryCache('user-1');

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      { id: 'user-1' },
      { aiSummaryCache: null, aiSummaryCachedAt: null },
    );
  });

  it('clears the cached summary when the portfolio is saved', async () => {
    await service.savePortfolio('user-1', { items: [] });

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      { id: 'user-1' },
      { aiSummaryCache: null, aiSummaryCachedAt: null },
    );
  });

  it('serves a fresh cached summary without calling the AI', async () => {
    mockUserRepo.findOne.mockResolvedValue(
      makeUser({ aiSummaryCache: makeCachedSummary(), aiSummaryCachedAt: new Date() }),
    );

    const result = await service.getAiMarketSummary('user-1');

    expect(result.summary).toBe('Cached summary text');
    expect(mockAiService.generateMarketSummary).not.toHaveBeenCalled();
  });

  it('regenerates once the cached summary is older than the TTL', async () => {
    mockUserRepo.findOne.mockResolvedValue(
      makeUser({
        aiSummaryCache: makeCachedSummary(),
        aiSummaryCachedAt: new Date(Date.now() - FIVE_MINUTES_MS - 1000),
      }),
    );

    const result = await service.getAiMarketSummary('user-1');

    expect(result.summary).toBe('Freshly generated summary');
    expect(mockAiService.generateMarketSummary).toHaveBeenCalled();
  });

  it('persists a newly generated summary so other replicas reuse it', async () => {
    mockUserRepo.findOne.mockResolvedValue(makeUser());

    await service.getAiMarketSummary('user-1');

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      { id: 'user-1' },
      expect.objectContaining({
        aiSummaryCache: expect.objectContaining({ summary: 'Freshly generated summary' }),
      }),
    );
  });

  it('does not cache the fallback when the AI call fails', async () => {
    mockUserRepo.findOne.mockResolvedValue(makeUser());
    mockAiService.generateMarketSummary.mockRejectedValue(new Error('gemini down'));

    const result = await service.getAiMarketSummary('user-1');

    expect(result.summary).toContain('unavailable');
    expect(mockUserRepo.update).not.toHaveBeenCalled();
  });
});
