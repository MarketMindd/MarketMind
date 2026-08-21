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
  const mockHistoryRepo = { query: jest.fn() };
  const mockStockRepo = { findBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockHistoryRepo.query.mockResolvedValue([]);
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
    mockHistoryRepo.query.mockResolvedValue([]);

    const result = await service.getPerformance();

    expect(result.stats.totalCalls).toBe(0);
    expect(result.stats.successRate).toBe(0);
    expect(result.stats.avgReturn).toBe(0);
    expect(result.recommendations).toEqual([]);
  });

  it('reads the stored grading instead of recomputing it', async () => {
    mockHistoryRepo.query.mockResolvedValue([
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
    mockHistoryRepo.query.mockResolvedValue([
      makeHistoryRow({ currentPrice: null, returnPct: null, outcome: null }),
    ]);

    const result = await service.getPerformance();

    expect(result.recommendations).toHaveLength(0);
    expect(result.stats.totalCalls).toBe(0);
  });

  it('excludes Hold rows from the success rate denominator', async () => {
    mockHistoryRepo.query.mockResolvedValue([
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

  it('computes average return across graded rows only', async () => {
    mockHistoryRepo.query.mockResolvedValue([
      makeHistoryRow({ id: 'uuid-1', stockSymbol: 'AAPL', returnPct: 10 as unknown as number }),
      makeHistoryRow({ id: 'uuid-2', stockSymbol: 'MSFT', returnPct: -20 as unknown as number }),
      makeHistoryRow({ id: 'uuid-3', stockSymbol: 'GOOG', returnPct: 5 as unknown as number }),
    ]);

    const result = await service.getPerformance();

    expect(result.stats.avgReturn).toBeCloseTo((10 + -20 + 5) / 3);
  });

  it('excludes Hold and ungraded rows from the average return', async () => {
    mockHistoryRepo.query.mockResolvedValue([
      makeHistoryRow({ id: 'uuid-1', stockSymbol: 'AAPL', returnPct: 10 as unknown as number }),
      makeHistoryRow({
        id: 'uuid-2',
        stockSymbol: 'MSFT',
        status: StockRecommendation.HOLD,
        returnPct: 40 as unknown as number,
      }),
      makeHistoryRow({
        id: 'uuid-3',
        stockSymbol: 'GOOG',
        outcome: RecommendationOutcome.NOT_APPLICABLE,
        returnPct: 0 as unknown as number,
      }),
      makeHistoryRow({ id: 'uuid-4', stockSymbol: 'AMZN', returnPct: 20 as unknown as number }),
    ]);

    const result = await service.getPerformance();

    expect(result.stats.avgReturn).toBeCloseTo(15);
    expect(result.stats.totalCalls).toBe(4);
  });

  it('resolves company name from stocks table', async () => {
    mockHistoryRepo.query.mockResolvedValue([makeHistoryRow({ stockSymbol: 'AAPL' })]);
    mockStockRepo.findBy.mockResolvedValue([
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
    ]);

    const result = await service.getPerformance();

    expect(result.recommendations[0].companyName).toBe('Apple Inc.');
  });

  it('falls back to stock symbol when stock is not in stocks table', async () => {
    mockHistoryRepo.query.mockResolvedValue([makeHistoryRow({ stockSymbol: 'AAPL' })]);
    mockStockRepo.findBy.mockResolvedValue([]);

    const result = await service.getPerformance();

    expect(result.recommendations[0].companyName).toBe('AAPL');
  });

  it('reports Hold accuracy separately from the directional hit rate', async () => {
    mockHistoryRepo.query.mockResolvedValue([
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
        outcome: RecommendationOutcome.SUCCESS,
      }),
      makeHistoryRow({
        id: 'uuid-3',
        stockSymbol: 'GOOG',
        status: StockRecommendation.HOLD,
        outcome: RecommendationOutcome.MISS,
      }),
      makeHistoryRow({
        id: 'uuid-4',
        stockSymbol: 'AMZN',
        status: StockRecommendation.HOLD,
        outcome: RecommendationOutcome.NOT_APPLICABLE,
      }),
    ]);

    const result = await service.getPerformance();

    expect(result.stats.directionalCount).toBe(1);
    expect(result.stats.successCount).toBe(1);
    expect(result.stats.holdGradedCount).toBe(2);
    expect(result.stats.holdSuccessCount).toBe(1);
  });

  it('caps returned recommendations to the default limit while keeping full stats', async () => {
    const rows = Array.from({ length: 150 }, (_, i) =>
      makeHistoryRow({
        id: `uuid-${i}`,
        stockSymbol: `SYM${i}`,
        createdAt: new Date(Date.now() - i * 1000),
      }),
    );
    mockHistoryRepo.query.mockResolvedValue(rows);

    const result = await service.getPerformance();

    expect(result.recommendations).toHaveLength(100);
    expect(result.stats.totalCalls).toBe(150);
    expect(result.recommendations[0].stockSymbol).toBe('SYM0');
  });

  it('honors an explicit limit', async () => {
    const rows = Array.from({ length: 10 }, (_, i) =>
      makeHistoryRow({ id: `uuid-${i}`, stockSymbol: `SYM${i}` }),
    );
    mockHistoryRepo.query.mockResolvedValue(rows);

    const result = await service.getPerformance(undefined, 3);

    expect(result.recommendations).toHaveLength(3);
    expect(result.stats.totalCalls).toBe(10);
  });

  it('returns the newest call first', async () => {
    await service.getPerformance();

    const [sql] = mockHistoryRepo.query.mock.calls[0];
    expect(sql.replace(/\s+/g, ' ')).toContain('ORDER BY "createdAt" DESC');
  });

  it('keeps every historical call rather than collapsing to one row per stock', async () => {
    await service.getPerformance();

    const [sql] = mockHistoryRepo.query.mock.calls[0];
    expect(sql).not.toContain('DISTINCT ON');
  });

  it('counts repeat calls on the same stock independently', async () => {
    mockHistoryRepo.query.mockResolvedValue([
      makeHistoryRow({
        id: 'uuid-1',
        stockSymbol: 'AAPL',
        status: StockRecommendation.INVEST,
        outcome: RecommendationOutcome.SUCCESS,
      }),
      makeHistoryRow({
        id: 'uuid-2',
        stockSymbol: 'AAPL',
        status: StockRecommendation.EXIT,
        outcome: RecommendationOutcome.MISS,
      }),
    ]);

    const result = await service.getPerformance();

    expect(result.stats.totalCalls).toBe(2);
    expect(result.stats.directionalCount).toBe(2);
    expect(result.stats.successCount).toBe(1);
  });

  it('filters by risk tolerance when one is supplied', async () => {
    await service.getPerformance(RiskTolerance.MEDIUM);

    const [sql, params] = mockHistoryRepo.query.mock.calls[0];
    expect(sql).toContain('"riskTolerance" = $1');
    expect(params).toEqual([RiskTolerance.MEDIUM]);
  });

  it('does not filter by risk tolerance when none is supplied', async () => {
    await service.getPerformance();

    const [sql, params] = mockHistoryRepo.query.mock.calls[0];
    expect(sql).not.toContain('"riskTolerance"');
    expect(params).toEqual([]);
  });

  it('reports since as the earliest call date regardless of row order', async () => {
    mockHistoryRepo.query.mockResolvedValue([
      makeHistoryRow({ id: 'uuid-1', stockSymbol: 'AAPL', createdAt: new Date('2024-09-15') }),
      makeHistoryRow({ id: 'uuid-2', stockSymbol: 'MSFT', createdAt: new Date('2024-01-05') }),
      makeHistoryRow({ id: 'uuid-3', stockSymbol: 'ZM', createdAt: new Date('2024-06-20') }),
    ]);

    const result = await service.getPerformance();

    expect(result.stats.since).toBe(new Date('2024-01-05').toISOString());
  });
});
