import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RiskTolerance, StockRecommendation } from '@market-mind/common';
import { MarketDataEntity, RecommendationHistoryEntity, StockEntity } from '@market-mind/database';
import { PerformanceService } from './performance.service';

const makeHistoryRow = (
  overrides: Partial<RecommendationHistoryEntity> = {},
): RecommendationHistoryEntity => ({
  id: 'uuid-1',
  stockSymbol: 'AAPL',
  riskTolerance: RiskTolerance.MEDIUM,
  status: StockRecommendation.INVEST,
  confidenceScore: 0.85,
  entryPrice: 165.2 as unknown as number,
  createdAt: new Date('2024-09-15'),
  ...overrides,
});

const makeMarketData = (price: number): MarketDataEntity =>
  ({
    stockSymbol: 'AAPL',
    time: new Date('2024-09-16'),
    price: price as unknown as number,
    volume: 1000,
    priceChange: 0,
  }) as MarketDataEntity;

describe('PerformanceService', () => {
  let service: PerformanceService;
  const mockHistoryRepo = { find: jest.fn() };
  const mockStockRepo = { findBy: jest.fn() };
  const mockMarketDataRepo = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockHistoryRepo.find.mockResolvedValue([]);
    mockStockRepo.findBy.mockResolvedValue([]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(110));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceService,
        { provide: getRepositoryToken(RecommendationHistoryEntity), useValue: mockHistoryRepo },
        { provide: getRepositoryToken(StockEntity), useValue: mockStockRepo },
        { provide: getRepositoryToken(MarketDataEntity), useValue: mockMarketDataRepo },
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

  it('computes Invest success correctly when return is positive', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.INVEST, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(110));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBe(10);
    expect(result.recommendations[0].outcome).toBe('Success');
  });

  it('computes Invest miss correctly when return is not positive', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.INVEST, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(90));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBe(-10);
    expect(result.recommendations[0].outcome).toBe('Miss');
  });

  it('treats Invest as success when the dip is within the noise band', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.INVEST, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(99.5));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBeCloseTo(-0.5);
    expect(result.recommendations[0].outcome).toBe('Success');
  });

  it('treats Invest as miss when the dip exceeds the noise band', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.INVEST, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(98));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBeCloseTo(-2);
    expect(result.recommendations[0].outcome).toBe('Miss');
  });

  it('computes Exit success correctly when return is negative', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.EXIT, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(80));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBe(-20);
    expect(result.recommendations[0].outcome).toBe('Success');
  });

  it('computes Exit miss correctly when return is not negative', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.EXIT, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(120));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBe(20);
    expect(result.recommendations[0].outcome).toBe('Miss');
  });

  it('treats Hold as success when price stays within the stability band', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.HOLD, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(98));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBe(-2);
    expect(result.recommendations[0].outcome).toBe('Success');
  });

  it('treats Hold as miss when price swings beyond the stability band', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ status: StockRecommendation.HOLD, entryPrice: 100 as unknown as number }),
    ]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(50));

    const result = await service.getPerformance();

    expect(result.recommendations[0].returnPct).toBe(-50);
    expect(result.recommendations[0].outcome).toBe('Miss');
  });

  it('excludes Hold rows from the success rate denominator', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({
        id: 'uuid-1',
        stockSymbol: 'AAPL',
        status: StockRecommendation.INVEST,
        entryPrice: 100 as unknown as number,
      }),
      makeHistoryRow({
        id: 'uuid-2',
        stockSymbol: 'MSFT',
        status: StockRecommendation.HOLD,
        entryPrice: 100 as unknown as number,
      }),
      makeHistoryRow({
        id: 'uuid-3',
        stockSymbol: 'GOOG',
        status: StockRecommendation.INVEST,
        entryPrice: 100 as unknown as number,
      }),
    ]);
    mockMarketDataRepo.findOne
      .mockResolvedValueOnce(makeMarketData(110))
      .mockResolvedValueOnce(makeMarketData(50))
      .mockResolvedValueOnce(makeMarketData(90));

    const result = await service.getPerformance();

    expect(result.stats.successRate).toBe(50);
  });

  it('computes average return across all rows including Hold', async () => {
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({
        id: 'uuid-1',
        stockSymbol: 'AAPL',
        status: StockRecommendation.INVEST,
        entryPrice: 100 as unknown as number,
      }),
      makeHistoryRow({
        id: 'uuid-2',
        stockSymbol: 'MSFT',
        status: StockRecommendation.HOLD,
        entryPrice: 100 as unknown as number,
      }),
      makeHistoryRow({
        id: 'uuid-3',
        stockSymbol: 'GOOG',
        status: StockRecommendation.EXIT,
        entryPrice: 100 as unknown as number,
      }),
    ]);
    mockMarketDataRepo.findOne
      .mockResolvedValueOnce(makeMarketData(110))
      .mockResolvedValueOnce(makeMarketData(80))
      .mockResolvedValueOnce(makeMarketData(105));

    const result = await service.getPerformance();

    expect(result.stats.avgReturn).toBeCloseTo((10 + -20 + 5) / 3);
  });

  it('excludes rows when no current price is available in market_data', async () => {
    mockHistoryRepo.find.mockResolvedValue([makeHistoryRow({ stockSymbol: 'AAPL' })]);
    mockMarketDataRepo.findOne.mockResolvedValue(null);

    const result = await service.getPerformance();

    expect(result.recommendations).toHaveLength(0);
    expect(result.stats.totalCalls).toBe(0);
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

  it('resolves current prices and company names in parallel', async () => {
    let resolveStocks: (value: StockEntity[]) => void = () => undefined;
    let resolveMarketData: (value: MarketDataEntity) => void = () => undefined;
    mockHistoryRepo.find.mockResolvedValue([
      makeHistoryRow({ stockSymbol: 'AAPL', entryPrice: 100 as unknown as number }),
    ]);
    mockStockRepo.findBy.mockReturnValue(
      new Promise<StockEntity[]>((resolve) => {
        resolveStocks = resolve;
      }),
    );
    mockMarketDataRepo.findOne.mockReturnValue(
      new Promise<MarketDataEntity>((resolve) => {
        resolveMarketData = resolve;
      }),
    );

    const resultPromise = service.getPerformance();
    await Promise.resolve();
    await Promise.resolve();

    expect(mockStockRepo.findBy).toHaveBeenCalledTimes(1);
    expect(mockMarketDataRepo.findOne).toHaveBeenCalledTimes(1);

    resolveStocks([{ symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' }]);
    resolveMarketData(makeMarketData(110));
    await expect(resultPromise).resolves.toEqual(
      expect.objectContaining({
        recommendations: [
          expect.objectContaining({
            companyName: 'Apple Inc.',
            currentPrice: 110,
          }),
        ],
      }),
    );
  });
});
