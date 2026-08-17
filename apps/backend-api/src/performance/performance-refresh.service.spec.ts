import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecommendationOutcome, RiskTolerance, StockRecommendation } from '@market-mind/common';
import { MarketDataEntity, RecommendationHistoryEntity } from '@market-mind/database';
import { PerformanceRefreshService } from './performance-refresh.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const makeHistoryRow = (
  overrides: Partial<RecommendationHistoryEntity> = {},
): RecommendationHistoryEntity => ({
  id: 'uuid-1',
  stockSymbol: 'AAPL',
  riskTolerance: RiskTolerance.MEDIUM,
  status: StockRecommendation.INVEST,
  confidenceScore: 0.85,
  entryPrice: 100 as unknown as number,
  createdAt: new Date(),
  currentPrice: null,
  returnPct: null,
  outcome: null,
  isFrozen: false,
  ...overrides,
});

const makeMarketData = (price: number): MarketDataEntity =>
  ({
    stockSymbol: 'AAPL',
    time: new Date(),
    price: price as unknown as number,
    volume: 1000,
    priceChange: 0,
  }) as MarketDataEntity;

describe('PerformanceRefreshService', () => {
  let service: PerformanceRefreshService;
  const mockHistoryRepo = { find: jest.fn(), save: jest.fn() };
  const mockMarketDataRepo = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockHistoryRepo.find.mockResolvedValue([]);
    mockMarketDataRepo.findOne.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceRefreshService,
        { provide: getRepositoryToken(RecommendationHistoryEntity), useValue: mockHistoryRepo },
        { provide: getRepositoryToken(MarketDataEntity), useValue: mockMarketDataRepo },
      ],
    }).compile();

    service = module.get<PerformanceRefreshService>(PerformanceRefreshService);
  });

  it('does nothing when there is no history', async () => {
    mockHistoryRepo.find.mockResolvedValue([]);

    await service.refresh();

    expect(mockHistoryRepo.save).not.toHaveBeenCalled();
  });

  it('does not touch rows that are already frozen', async () => {
    const frozenRow = makeHistoryRow({
      isFrozen: true,
      currentPrice: 120 as unknown as number,
      returnPct: 20 as unknown as number,
      outcome: RecommendationOutcome.SUCCESS,
    });
    mockHistoryRepo.find.mockResolvedValue([frozenRow]);

    await service.refresh();

    expect(mockMarketDataRepo.findOne).not.toHaveBeenCalled();
    expect(mockHistoryRepo.save).not.toHaveBeenCalled();
  });

  it('grades a fresh row against the live price without freezing it', async () => {
    const row = makeHistoryRow({ createdAt: new Date() });
    mockHistoryRepo.find.mockResolvedValue([row]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(110));

    await service.refresh();

    expect(mockHistoryRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({
        currentPrice: 110,
        returnPct: 10,
        outcome: 'Success',
        isFrozen: false,
      }),
    ]);
  });

  it('freezes a row at the next call entry price once the recommendation changes', async () => {
    const supersededRow = makeHistoryRow({
      id: 'uuid-old',
      status: StockRecommendation.INVEST,
      entryPrice: 100 as unknown as number,
      createdAt: new Date('2024-09-15T00:00:00Z'),
    });
    const newerRow = makeHistoryRow({
      id: 'uuid-new',
      status: StockRecommendation.EXIT,
      entryPrice: 120 as unknown as number,
      createdAt: new Date('2024-09-15T06:00:00Z'),
      isFrozen: true,
    });
    mockHistoryRepo.find.mockResolvedValue([supersededRow, newerRow]);

    await service.refresh();

    expect(mockMarketDataRepo.findOne).not.toHaveBeenCalled();
    expect(mockHistoryRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'uuid-old',
        currentPrice: 120,
        returnPct: 20,
        outcome: 'Success',
        isFrozen: true,
      }),
    ]);
  });

  it('freezes a row at the 24-hour price once a day passes without a status change', async () => {
    const row = makeHistoryRow({
      entryPrice: 100 as unknown as number,
      createdAt: new Date(Date.now() - 2 * ONE_DAY_MS),
    });
    mockHistoryRepo.find.mockResolvedValue([row]);
    mockMarketDataRepo.findOne.mockResolvedValue(makeMarketData(105));

    await service.refresh();

    expect(mockHistoryRepo.save).toHaveBeenCalledWith([
      expect.objectContaining({ currentPrice: 105, returnPct: 5, isFrozen: true }),
    ]);
  });

  it('leaves a row unsaved when the freeze-point price cannot be resolved', async () => {
    const row = makeHistoryRow({ createdAt: new Date(Date.now() - 2 * ONE_DAY_MS) });
    mockHistoryRepo.find.mockResolvedValue([row]);
    mockMarketDataRepo.findOne.mockResolvedValue(null);

    await service.refresh();

    expect(mockHistoryRepo.save).not.toHaveBeenCalled();
  });
});
