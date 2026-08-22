import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiRecommendation, RiskTolerance, StockRecommendation } from '@market-mind/common';
import {
  MarketDataEntity,
  RecommendationEntity,
  RecommendationHistoryEntity,
} from '@market-mind/database';
import { NotificationService } from '../notification/notification.service';
import { ProcessingService } from './processing.service';

const makeRec = (overrides: Partial<AiRecommendation> = {}): AiRecommendation => ({
  symbol: 'AAPL',
  riskTolerance: RiskTolerance.MEDIUM,
  status: StockRecommendation.INVEST,
  confidence: 0.85,
  rationale: 'Strong fundamentals',
  aiSummary: 'Strong setup.',
  shortTermOutlook: 'Near-term outlook is constructive.',
  longTermOutlook: 'Long-term outlook remains positive.',
  generatedAt: new Date(),
  ...overrides,
});

describe('ProcessingService', () => {
  let service: ProcessingService;
  const mockRepo = {
    findOne: jest.fn(),
    upsert: jest.fn().mockResolvedValue(undefined),
  };
  const mockHistoryRepo = {
    findOne: jest.fn(),
    save: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockImplementation((dto) => dto),
  };
  const mockMarketDataRepo = {
    findOne: jest.fn(),
  };
  const mockNotificationService = {
    notifyRecommendationChange: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.upsert.mockResolvedValue(undefined);
    mockHistoryRepo.findOne.mockResolvedValue(null);
    mockHistoryRepo.save.mockResolvedValue(undefined);
    mockHistoryRepo.create.mockImplementation((dto) => dto);
    mockMarketDataRepo.findOne.mockResolvedValue(null);
    mockNotificationService.notifyRecommendationChange.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessingService,
        { provide: getRepositoryToken(RecommendationEntity), useValue: mockRepo },
        { provide: getRepositoryToken(RecommendationHistoryEntity), useValue: mockHistoryRepo },
        { provide: getRepositoryToken(MarketDataEntity), useValue: mockMarketDataRepo },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<ProcessingService>(ProcessingService);
  });

  it('returns immediately without touching the repo when given an empty array', async () => {
    await service.process([]);
    expect(mockRepo.findOne).not.toHaveBeenCalled();
    expect(mockRepo.upsert).not.toHaveBeenCalled();
    expect(mockHistoryRepo.findOne).not.toHaveBeenCalled();
  });

  it('calls upsert once with correct field mapping for a single recommendation', async () => {
    const rec = makeRec();
    mockRepo.findOne.mockResolvedValue(null);
    await service.process([rec]);

    expect(mockRepo.upsert).toHaveBeenCalledTimes(1);
    expect(mockRepo.upsert).toHaveBeenCalledWith(
      {
        stockSymbol: rec.symbol,
        riskTolerance: rec.riskTolerance,
        status: rec.status,
        confidenceScore: rec.confidence,
        rationale: rec.rationale,
        aiSummary: rec.aiSummary,
        shortTermOutlook: rec.shortTermOutlook,
        longTermOutlook: rec.longTermOutlook,
      },
      ['stockSymbol', 'riskTolerance'],
    );
  });

  it('uses the correct conflict keys: [stockSymbol, riskTolerance]', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await service.process([makeRec()]);
    const conflictKeys = mockRepo.upsert.mock.calls[0][1];
    expect(conflictKeys).toEqual(['stockSymbol', 'riskTolerance']);
  });

  it('calls upsert twice for two recommendations with different risk tolerances', async () => {
    const recLow = makeRec({ riskTolerance: RiskTolerance.LOW });
    const recHigh = makeRec({ riskTolerance: RiskTolerance.HIGH });
    mockRepo.findOne.mockResolvedValue(null);

    await service.process([recLow, recHigh]);

    expect(mockRepo.upsert).toHaveBeenCalledTimes(2);
    expect(mockRepo.upsert.mock.calls[0][0].riskTolerance).toBe(RiskTolerance.LOW);
    expect(mockRepo.upsert.mock.calls[1][0].riskTolerance).toBe(RiskTolerance.HIGH);
  });

  it('does not throw when one upsert fails, and continues processing remaining recommendations', async () => {
    const recFail = makeRec({ symbol: 'FAIL', riskTolerance: RiskTolerance.LOW });
    const recOk = makeRec({ symbol: 'AAPL', riskTolerance: RiskTolerance.HIGH });

    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.upsert.mockRejectedValueOnce(new Error('DB error')).mockResolvedValueOnce(undefined);

    await expect(service.process([recFail, recOk])).resolves.not.toThrow();
    expect(mockRepo.upsert).toHaveBeenCalledTimes(2);
    expect(mockRepo.upsert.mock.calls[1][0].stockSymbol).toBe('AAPL');
  });

  it('sends email on first recommendation creation', async () => {
    const rec = makeRec();
    mockRepo.findOne.mockResolvedValue(null);

    await service.process([rec]);

    expect(mockNotificationService.notifyRecommendationChange).toHaveBeenCalledWith({
      stockSymbol: rec.symbol,
      riskTolerance: rec.riskTolerance,
      previousStatus: null,
      newStatus: rec.status,
      rationale: rec.rationale,
    });
    expect(mockRepo.upsert.mock.invocationCallOrder[0]).toBeLessThan(
      mockNotificationService.notifyRecommendationChange.mock.invocationCallOrder[0],
    );
  });

  it('sends email when recommendation status changes', async () => {
    const rec = makeRec({ status: StockRecommendation.HOLD });
    mockRepo.findOne.mockResolvedValue({ status: 'Invest' });

    await service.process([rec]);

    expect(mockNotificationService.notifyRecommendationChange).toHaveBeenCalledWith({
      stockSymbol: rec.symbol,
      riskTolerance: rec.riskTolerance,
      previousStatus: 'Invest',
      newStatus: 'Hold',
      rationale: rec.rationale,
    });
  });

  it('does not send email when only rationale or confidence changes', async () => {
    const rec = makeRec({ confidence: 0.9, rationale: 'Updated rationale' });
    mockRepo.findOne.mockResolvedValue({ status: 'Invest' });

    await service.process([rec]);

    expect(mockNotificationService.notifyRecommendationChange).not.toHaveBeenCalled();
  });

  it('keeps processing successful when email sending fails', async () => {
    const rec = makeRec();
    mockRepo.findOne.mockResolvedValue(null);
    mockNotificationService.notifyRecommendationChange.mockRejectedValueOnce(
      new Error('Resend unavailable'),
    );

    await expect(service.process([rec])).resolves.not.toThrow();

    expect(mockRepo.upsert).toHaveBeenCalledTimes(1);
    expect(mockNotificationService.notifyRecommendationChange).toHaveBeenCalledTimes(1);
  });

  it('inserts history row when no previous history exists', async () => {
    const rec = makeRec();
    mockRepo.findOne.mockResolvedValue(null);
    mockHistoryRepo.findOne.mockResolvedValue(null);
    mockMarketDataRepo.findOne.mockResolvedValue({ price: '165.20' });

    await service.process([rec]);

    expect(mockHistoryRepo.save).toHaveBeenCalledTimes(1);
    expect(mockHistoryRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        stockSymbol: 'AAPL',
        riskTolerance: RiskTolerance.MEDIUM,
        status: 'Invest',
        confidenceScore: 0.85,
        entryPrice: 165.2,
      }),
    );
  });

  it('inserts history row when status changes', async () => {
    mockHistoryRepo.findOne.mockResolvedValue({
      status: 'Invest',
      createdAt: new Date(),
    });
    mockMarketDataRepo.findOne.mockResolvedValue({ price: '165.20', time: new Date() });

    await service.process([makeRec({ status: StockRecommendation.HOLD })]);

    expect(mockHistoryRepo.save).toHaveBeenCalledTimes(1);
  });

  it('skips history insert when status is unchanged', async () => {
    mockHistoryRepo.findOne.mockResolvedValue({
      status: 'Invest',
      createdAt: new Date(),
    });

    await service.process([makeRec({ status: StockRecommendation.INVEST })]);

    expect(mockHistoryRepo.save).not.toHaveBeenCalled();
    expect(mockMarketDataRepo.findOne).not.toHaveBeenCalled();
  });

  it('snapshots entryPrice from latest market_data', async () => {
    mockHistoryRepo.findOne.mockResolvedValue(null);
    mockMarketDataRepo.findOne.mockResolvedValue({
      price: '178.52',
      time: new Date(),
    });

    await service.process([makeRec()]);

    expect(mockMarketDataRepo.findOne).toHaveBeenCalledWith({
      where: { stockSymbol: 'AAPL' },
      order: { time: 'DESC' },
    });
    expect(mockHistoryRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        entryPrice: 178.52,
      }),
    );
  });

  it('skips history insert and logs a warning when no market_data row exists', async () => {
    mockHistoryRepo.findOne.mockResolvedValue(null);
    mockMarketDataRepo.findOne.mockResolvedValue(null);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    await service.process([makeRec()]);

    expect(mockHistoryRepo.save).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No market data found for AAPL'));
  });

  it('history insert failure does not abort processing of remaining recommendations', async () => {
    mockHistoryRepo.findOne.mockResolvedValue(null);
    mockMarketDataRepo.findOne.mockResolvedValue({ price: '165.20', time: new Date() });
    mockHistoryRepo.save.mockRejectedValueOnce(new Error('history unavailable'));

    await expect(
      service.process([makeRec({ symbol: 'FAIL' }), makeRec({ symbol: 'AAPL' })]),
    ).resolves.not.toThrow();

    expect(mockRepo.upsert).toHaveBeenCalledTimes(2);
    expect(mockHistoryRepo.save).toHaveBeenCalledTimes(2);
  });
});
