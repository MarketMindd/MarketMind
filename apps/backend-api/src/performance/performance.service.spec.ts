import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecommendationOutcome, RiskTolerance, StockRecommendation } from '@market-mind/common';
import { RecommendationHistoryEntity, StockEntity } from '@market-mind/database';
import { PerformanceService } from './performance.service';

const makeHistoryRow = (
  overrides: Partial<RecommendationHistoryEntity> = {},
): RecommendationHistoryEntity => ({
  id: 'uuid-1',
  stockSymbol: 'AAPL',
  riskTolerance: RiskTolerance.MEDIUM,
  status: StockRecommendation.INVEST,
  confidenceScore: 0.85,
  entryPrice: 100,
  createdAt: new Date('2024-09-15'),
  currentPrice: 110,
  returnPct: 10,
  outcome: RecommendationOutcome.SUCCESS,
  isFrozen: false,
  ...overrides,
});

describe('PerformanceService', () => {
  let service: PerformanceService;
  const mockHistoryRepo = { find: jest.fn() };
  const mockStockRepo = { findBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockHistoryRepo.find.mockResolvedValue([]);
    mockStockRepo.findBy.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceService,
        { provide: getRepositoryToken(RecommendationHistoryEntity), useValue: mockHistoryRepo },
        { provide: getRepositoryToken(StockEntity), useValue: mockStockRepo },
      ],
    }).compile();

    service = module.get<PerformanceService>(PerformanceService);
  });

  it('returns empty response when no history rows exist', async () => {
    mockHistoryRepo.find.mockResolvedValue([]);

    const result = await service.getPerformance();

    expect(result.stats.totalCalls).toBe(0);
    expect(result.stats.successRate).toBe(0);
    expect(result.stats.avgReturn).toBe(0);
    expect(result.recommendations).toEqual([]);
  });

  it('reads the stored grading instead of recomputing it', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({
        status: StockRecommendation.INVEST,
        entryPrice: 100 as unknown as number,
        currentPrice: 110 as unknown as number,
        returnPct: 10 as unknown as number,
        outcome: RecommendationOutcome.SUCCESS,
      }),
    ]);

    const result = await service.getPerformance();

    expect(result.recommendations[0].currentPrice).toBe(110);
    expect(result.recommendations[0].returnPct).toBe(10);
    expect(result.recommendations[0].outcome).toBe('Success');
  });

  it('excludes rows the background job has not graded yet', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ currentPrice: null, returnPct: null, outcome: null }),
    ]);

    const result = await service.getPerformance();

    expect(result.recommendations).toHaveLength(0);
    expect(result.stats.totalCalls).toBe(0);
  });

  it('excludes Hold rows from the success rate denominator', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({
        id: 'uuid-1',
        stockSymbol: 'AAPL',
        status: StockRecommendation.INVEST,
        outcome: RecommendationOutcome.SUCCESS,
      }),
      makeHistoryRow({
        id: 'uuid-2',
        stockSymbol: 'MSFT',
        status: StockRecommendation.HOLD,
        outcome: RecommendationOutcome.MISS,
      }),
      makeHistoryRow({
        id: 'uuid-3',
        stockSymbol: 'GOOG',
        status: StockRecommendation.INVEST,
        outcome: RecommendationOutcome.MISS,
      }),
    ]);

    const result = await service.getPerformance();

    expect(result.stats.successRate).toBe(50);
    expect(result.stats.directionalCount).toBe(2);
  });

  it('computes average return across all rows including Hold', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ id: 'uuid-1', stockSymbol: 'AAPL', returnPct: 10 as unknown as number }),
      makeHistoryRow({ id: 'uuid-2', stockSymbol: 'MSFT', returnPct: -20 as unknown as number }),
      makeHistoryRow({ id: 'uuid-3', stockSymbol: 'GOOG', returnPct: 5 as unknown as number }),
    ]);

    const result = await service.getPerformance();

    expect(result.stats.avgReturn).toBeCloseTo((10 + -20 + 5) / 3);
  });

  it('resolves company name from stocks table', async () => {
    mockHistoryRepo.find.mockResolvedValue([makeHistoryRow({ stockSymbol: 'AAPL' })]);
    mockStockRepo.findBy.mockResolvedValue([
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    ]);

    const result = await service.getPerformance();

    expect(result.recommendations[0].companyName).toBe('Apple Inc.');
  });

  it('falls back to stock symbol when stock is not in stocks table', async () => {
    mockHistoryRepo.find.mockResolvedValue([makeHistoryRow({ stockSymbol: 'AAPL' })]);
    mockStockRepo.findBy.mockResolvedValue([]);

    const result = await service.getPerformance();

    expect(result.recommendations[0].companyName).toBe('AAPL');
  });
});
