import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RiskTolerance } from '@market-mind/common';
import {
  PortfolioEntity,
  RecommendationEntity,
  SymbolFilterStateEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { MarketSnapshot } from '../market/market.types';
import { AlphaVantageService } from '../news/alpha-vantage.service';
import { MassiveApiService } from '../news/massive.service';
import { NewsApiService } from '../news/news-api.service';
import { FilterService } from './filter.service';

const makeSnapshot = (priceChange: number, fetchedAt = new Date()): MarketSnapshot => ({
  symbol: 'AAPL',
  price: 150,
  priceChange,
  volume: 1000000,
  fetchedAt,
});

const mockUser = { id: 'user-1', riskTolerance: RiskTolerance.MEDIUM };
const mockPortfolio = { userId: 'user-1' };
const noRecommendations: Pick<RecommendationEntity, 'riskTolerance'>[] = [];

// Builds a SymbolFilterStateEntity-shaped row with a recent updatedAt by default
const makeStateRow = (lastForwardedPriceChange: number, ageMs = 15 * 60 * 1000) => ({
  stockSymbol: 'AAPL',
  lastForwardedPriceChange,
  updatedAt: new Date(Date.now() - ageMs),
});

describe('FilterService', () => {
  let service: FilterService;
  let mockGetNewsApiNews: jest.Mock;
  let mockGetAlphaVantageNews: jest.Mock;
  let mockGetMassiveNews: jest.Mock;

  const mockFilterStateRepo = {
    findOne: jest.fn(),
    upsert: jest.fn().mockResolvedValue(undefined),
  };

  const mockPortfolioRepo = {
    find: jest.fn().mockResolvedValue([mockPortfolio]),
  };

  const buildUserProfileQb = () => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockUser]),
  });

  const mockUserProfileRepo = {
    createQueryBuilder: jest.fn(),
  };

  const mockRecommendationRepo = {
    find: jest.fn().mockResolvedValue(noRecommendations),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockFilterStateRepo.findOne.mockResolvedValue(null);
    mockUserProfileRepo.createQueryBuilder.mockReturnValue(buildUserProfileQb());
    mockRecommendationRepo.find.mockResolvedValue(noRecommendations);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterService,
        { provide: getRepositoryToken(SymbolFilterStateEntity), useValue: mockFilterStateRepo },
        { provide: getRepositoryToken(PortfolioEntity), useValue: mockPortfolioRepo },
        { provide: getRepositoryToken(UserProfileEntity), useValue: mockUserProfileRepo },
        { provide: getRepositoryToken(RecommendationEntity), useValue: mockRecommendationRepo },
        {
          provide: NewsApiService,
          useValue: {
            getNews: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: AlphaVantageService,
          useValue: {
            getNews: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: MassiveApiService,
          useValue: {
            getNews: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<FilterService>(FilterService);

    mockGetNewsApiNews = module.get(NewsApiService).getNews as jest.Mock;
    mockGetAlphaVantageNews = module.get(AlphaVantageService).getNews as jest.Mock;
    mockGetMassiveNews = module.get(MassiveApiService).getNews as jest.Mock;
    mockGetNewsApiNews.mockResolvedValue([]);
    mockGetAlphaVantageNews.mockResolvedValue([]);
    mockGetMassiveNews.mockResolvedValue([]);
  });

  it('cold start passes dedup when no prior state exists', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(null);
    const result = await service.filter(makeSnapshot(2));
    expect(result).not.toBeNull();
  });

  it('dedup blocks when cumulative delta < 0.5% from last forward', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    const result = await service.filter(makeSnapshot(2.3));
    expect(result).toBeNull();
  });

  it('cumulative drift: 0.4% per cycle accumulates and triggers at 1%', async () => {
    // After forwarding at 2%, the next forward resets the baseline.
    // Simulate: lastForwarded=2%, current=2.4% → delta=0.4 → skip
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockRecommendationRepo.find.mockResolvedValue([{ riskTolerance: RiskTolerance.MEDIUM }]);
    expect(await service.filter(makeSnapshot(2.4))).toBeNull();

    // State NOT updated (no forward) → baseline stays at 2%.
    // current=2.8% → delta=0.8 → skip
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockRecommendationRepo.find.mockResolvedValue([{ riskTolerance: RiskTolerance.MEDIUM }]);
    expect(await service.filter(makeSnapshot(2.8))).toBeNull();

    // current=3.1% → delta=1.1 >= 1% → triggers
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockRecommendationRepo.find.mockResolvedValue([{ riskTolerance: RiskTolerance.MEDIUM }]);
    const result = await service.filter(makeSnapshot(3.1));
    expect(result).not.toBeNull();
  });

  it('state upserted only on confirmed forward', async () => {
    // Dedup skip — no upsert
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    await service.filter(makeSnapshot(2.3));
    expect(mockFilterStateRepo.upsert).not.toHaveBeenCalled();

    // Confirmed forward — upsert called
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockRecommendationRepo.find.mockResolvedValue([{ riskTolerance: RiskTolerance.MEDIUM }]);
    await service.filter(makeSnapshot(3.1));
    expect(mockFilterStateRepo.upsert).toHaveBeenCalledTimes(1);
    expect(mockFilterStateRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ stockSymbol: 'AAPL', lastForwardedPriceChange: 3.1 }),
      ['stockSymbol'],
    );
  });

  it('stale state bypasses significance when tracked risk coverage is missing', async () => {
    const oneDayPlusMs = 25 * 60 * 60 * 1000;
    // Old lastForwardedPriceChange of 1.8% — would block if treated as fresh
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(1.8, oneDayPlusMs));
    // delta vs 0 (cold start baseline) = 0.3%, which is < 1% significance,
    // but missing recommendation coverage should still forward.
    const result = await service.filter(makeSnapshot(0.3));
    expect(result).not.toBeNull();
  });

  it('news-only trigger: delta between 0.5-1% with recent articles', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    const recentArticle = {
      title: 'Apple news',
      description: null,
      publishedAt: new Date().toISOString(),
      source: { id: null, name: 'Reuters' },
    };
    mockGetNewsApiNews.mockResolvedValue([recentArticle]);

    const result = await service.filter(makeSnapshot(2.6));
    expect(result).not.toBeNull();
    expect(result?.news).toHaveLength(1);
  });

  it('significance skip: delta between 0.5-1% with no recent news', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockRecommendationRepo.find.mockResolvedValue([{ riskTolerance: RiskTolerance.MEDIUM }]);
    const oldArticle = {
      title: 'Old Apple news',
      description: null,
      publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: { id: null, name: 'Reuters' },
    };
    mockGetNewsApiNews.mockResolvedValue([oldArticle]);

    const result = await service.filter(makeSnapshot(2.6));
    expect(result).toBeNull();
  });

  it('bypasses significance when a tracked risk tolerance has no recommendation yet', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockRecommendationRepo.find.mockResolvedValue([]);

    const oldArticle = {
      title: 'Old Apple news',
      description: null,
      publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: { id: null, name: 'Reuters' },
    };
    mockGetNewsApiNews.mockResolvedValue([oldArticle]);

    const result = await service.filter(makeSnapshot(2.6));
    expect(result).not.toBeNull();
    expect(mockRecommendationRepo.find).toHaveBeenCalledWith({
      where: { stockSymbol: 'AAPL' },
      select: ['riskTolerance'],
    });
  });

  it('bypasses significance when recommendation coverage is incomplete across tracked risks', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockPortfolioRepo.find.mockResolvedValueOnce([{ userId: 'user-1' }, { userId: 'user-2' }]);

    const userProfileQb = buildUserProfileQb();
    userProfileQb.getMany.mockResolvedValueOnce([
      { id: 'user-1', riskTolerance: RiskTolerance.LOW },
      { id: 'user-2', riskTolerance: RiskTolerance.HIGH },
    ]);
    mockUserProfileRepo.createQueryBuilder.mockReturnValueOnce(userProfileQb);

    mockRecommendationRepo.find.mockResolvedValueOnce([{ riskTolerance: RiskTolerance.LOW }]);

    const oldArticle = {
      title: 'Old Apple news',
      description: null,
      publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: { id: null, name: 'Reuters' },
    };
    mockGetNewsApiNews.mockResolvedValue([oldArticle]);

    const result = await service.filter(makeSnapshot(2.6));
    expect(result).not.toBeNull();
  });

  it('still skips significance when all tracked risks already have recommendation coverage', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(makeStateRow(2));
    mockPortfolioRepo.find.mockResolvedValueOnce([{ userId: 'user-1' }, { userId: 'user-2' }]);

    const userProfileQb = buildUserProfileQb();
    userProfileQb.getMany.mockResolvedValueOnce([
      { id: 'user-1', riskTolerance: RiskTolerance.LOW },
      { id: 'user-2', riskTolerance: RiskTolerance.HIGH },
    ]);
    mockUserProfileRepo.createQueryBuilder.mockReturnValueOnce(userProfileQb);

    mockRecommendationRepo.find.mockResolvedValueOnce([
      { riskTolerance: RiskTolerance.LOW },
      { riskTolerance: RiskTolerance.HIGH },
    ]);

    const oldArticle = {
      title: 'Old Apple news',
      description: null,
      publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: { id: null, name: 'Reuters' },
    };
    mockGetNewsApiNews.mockResolvedValue([oldArticle]);

    const result = await service.filter(makeSnapshot(2.6));
    expect(result).toBeNull();
  });

  it('returns null and skips news API when no users track the symbol', async () => {
    mockPortfolioRepo.find.mockResolvedValueOnce([]);
    await service.filter(makeSnapshot(5));
    expect(mockGetNewsApiNews).not.toHaveBeenCalled();
  });

  it('news fetch failure is non-fatal — pipeline continues with empty articles', async () => {
    mockFilterStateRepo.findOne.mockResolvedValue(null);
    mockGetNewsApiNews.mockRejectedValue(new Error('Network error'));

    const result = await service.filter(makeSnapshot(5));
    expect(result).not.toBeNull();
    expect(result?.news).toHaveLength(0);
  });
});
