import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiRecommendation, RiskTolerance, StockRecommendation } from '@market-mind/common';
import { RecommendationEntity } from '@market-mind/database';
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
    upsert: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessingService,
        { provide: getRepositoryToken(RecommendationEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProcessingService>(ProcessingService);
  });

  it('returns immediately without touching the repo when given an empty array', async () => {
    await service.process([]);
    expect(mockRepo.upsert).not.toHaveBeenCalled();
  });

  it('calls upsert once with correct field mapping for a single recommendation', async () => {
    const rec = makeRec();
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
    await service.process([makeRec()]);
    const conflictKeys = mockRepo.upsert.mock.calls[0][1];
    expect(conflictKeys).toEqual(['stockSymbol', 'riskTolerance']);
  });

  it('calls upsert twice for two recommendations with different risk tolerances', async () => {
    const recLow = makeRec({ riskTolerance: RiskTolerance.LOW });
    const recHigh = makeRec({ riskTolerance: RiskTolerance.HIGH });

    await service.process([recLow, recHigh]);

    expect(mockRepo.upsert).toHaveBeenCalledTimes(2);
    expect(mockRepo.upsert.mock.calls[0][0].riskTolerance).toBe(RiskTolerance.LOW);
    expect(mockRepo.upsert.mock.calls[1][0].riskTolerance).toBe(RiskTolerance.HIGH);
  });

  it('does not throw when one upsert fails, and continues processing remaining recommendations', async () => {
    const recFail = makeRec({ symbol: 'FAIL', riskTolerance: RiskTolerance.LOW });
    const recOk = makeRec({ symbol: 'AAPL', riskTolerance: RiskTolerance.HIGH });

    mockRepo.upsert.mockRejectedValueOnce(new Error('DB error')).mockResolvedValueOnce(undefined);

    await expect(service.process([recFail, recOk])).resolves.not.toThrow();
    expect(mockRepo.upsert).toHaveBeenCalledTimes(2);
    expect(mockRepo.upsert.mock.calls[1][0].stockSymbol).toBe('AAPL');
  });
});
