import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service.js';
import { PromptBuilderService } from './prompt-builder.service.js';
import { GeminiClientService } from './gemini-client.service.js';
import { ResponseParserService } from './response-parser.service.js';
import { RiskTolerance } from '@market-mind/common';
import type { FilteredSnapshot } from '../filter/filter.types.js';
import type { AiRecommendation } from '@market-mind/common';

const makeRecommendation = (
  symbol: string,
  riskTolerance: RiskTolerance,
): AiRecommendation => ({
  status: 'Invest',
  confidence: 0.8,
  rationale: 'Good momentum',
  symbol,
  riskTolerance,
  generatedAt: new Date(),
});

const makeSnapshot = (
  users: { userId: string; riskTolerance: RiskTolerance }[],
): FilteredSnapshot => ({
  snapshot: {
    symbol: 'AAPL',
    price: 150,
    priceChange: 2,
    volume: 1_000_000,
    fetchedAt: new Date(),
  },
  news: [],
  users,
});

describe('AiService', () => {
  let service: AiService;
  let mockPromptBuilder: { build: jest.Mock };
  let mockGeminiClient: { generateRecommendation: jest.Mock };
  let mockResponseParser: { parse: jest.Mock };

  beforeEach(async () => {
    mockPromptBuilder = { build: jest.fn().mockReturnValue('prompt') };
    mockGeminiClient = {
      generateRecommendation: jest
        .fn()
        .mockResolvedValue('{"status":"Invest","confidence":0.8,"rationale":"Good"}'),
    };
    mockResponseParser = { parse: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PromptBuilderService, useValue: mockPromptBuilder },
        { provide: GeminiClientService, useValue: mockGeminiClient },
        { provide: ResponseParserService, useValue: mockResponseParser },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('returns empty array when user list is empty', async () => {
    const result = await service.analyze(makeSnapshot([]));
    expect(result).toEqual([]);
    expect(mockGeminiClient.generateRecommendation).not.toHaveBeenCalled();
  });

  it('calls Gemini exactly once for multiple users sharing the same risk tolerance', async () => {
    mockResponseParser.parse.mockReturnValue(
      makeRecommendation('AAPL', RiskTolerance.MEDIUM),
    );
    const users = [
      { userId: 'u1', riskTolerance: RiskTolerance.MEDIUM },
      { userId: 'u2', riskTolerance: RiskTolerance.MEDIUM },
      { userId: 'u3', riskTolerance: RiskTolerance.MEDIUM },
    ];
    await service.analyze(makeSnapshot(users));
    expect(mockGeminiClient.generateRecommendation).toHaveBeenCalledTimes(1);
  });

  it('calls Gemini once per unique risk tolerance', async () => {
    mockResponseParser.parse
      .mockReturnValueOnce(makeRecommendation('AAPL', RiskTolerance.LOW))
      .mockReturnValueOnce(makeRecommendation('AAPL', RiskTolerance.HIGH));

    const users = [
      { userId: 'u1', riskTolerance: RiskTolerance.LOW },
      { userId: 'u2', riskTolerance: RiskTolerance.HIGH },
      { userId: 'u3', riskTolerance: RiskTolerance.LOW },
    ];
    const result = await service.analyze(makeSnapshot(users));
    expect(mockGeminiClient.generateRecommendation).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it('continues processing remaining groups when one risk group fails', async () => {
    mockGeminiClient.generateRecommendation
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce('raw');
    mockResponseParser.parse.mockReturnValueOnce(
      makeRecommendation('AAPL', RiskTolerance.HIGH),
    );

    const users = [
      { userId: 'u1', riskTolerance: RiskTolerance.LOW },
      { userId: 'u2', riskTolerance: RiskTolerance.HIGH },
    ];
    const result = await service.analyze(makeSnapshot(users));
    expect(result).toHaveLength(1);
    expect(result[0].riskTolerance).toBe(RiskTolerance.HIGH);
  });

  it('returns empty array when all risk groups fail', async () => {
    mockGeminiClient.generateRecommendation.mockRejectedValue(new Error('API down'));

    const users = [
      { userId: 'u1', riskTolerance: RiskTolerance.LOW },
      { userId: 'u2', riskTolerance: RiskTolerance.HIGH },
    ];
    const result = await service.analyze(makeSnapshot(users));
    expect(result).toEqual([]);
  });
});
