import { Test, TestingModule } from '@nestjs/testing';
import { AiRecommendation, RiskTolerance, StockRecommendation } from '@market-mind/common';
import type { FilteredSnapshot } from '../filter/filter.types';
import { AiService } from './ai.service';
import { LLM_CLIENT } from './llm-client.interface';
import { PromptBuilderService } from './prompt-builder.service';
import { ResponseParserService } from './response-parser.service';

const makeRecommendation = (symbol: string, riskTolerance: RiskTolerance): AiRecommendation => ({
  status: StockRecommendation.INVEST,
  confidence: 0.8,
  rationale: 'Good momentum',
  symbol,
  riskTolerance,
  generatedAt: new Date(),
});

const makeSnapshot = (riskTolerances: RiskTolerance[]): FilteredSnapshot => ({
  snapshot: {
    symbol: 'AAPL',
    price: 150,
    priceChange: 2,
    volume: 1_000_000,
    fetchedAt: new Date(),
  },
  news: [],
  riskTolerances,
});

describe('AiService', () => {
  let service: AiService;
  let mockPromptBuilder: { buildRecommendationPrompt: jest.Mock };
  let mockLlmClient: { generateContent: jest.Mock };
  let mockResponseParser: { parse: jest.Mock };

  beforeEach(async () => {
    mockPromptBuilder = { buildRecommendationPrompt: jest.fn().mockReturnValue('prompt') };
    mockLlmClient = {
      generateContent: jest
        .fn()
        .mockResolvedValue('{"status":"Invest","confidence":0.8,"rationale":"Good"}'),
    };
    mockResponseParser = { parse: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PromptBuilderService, useValue: mockPromptBuilder },
        { provide: LLM_CLIENT, useValue: mockLlmClient },
        { provide: ResponseParserService, useValue: mockResponseParser },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('returns empty array when risk tolerance list is empty', async () => {
    const result = await service.analyze(makeSnapshot([]));
    expect(result).toEqual([]);
    expect(mockLlmClient.generateContent).not.toHaveBeenCalled();
  });

  it('calls Gemini exactly once for duplicate risk tolerances', async () => {
    mockResponseParser.parse.mockReturnValue(makeRecommendation('AAPL', RiskTolerance.MEDIUM));
    const riskTolerances = [RiskTolerance.MEDIUM, RiskTolerance.MEDIUM, RiskTolerance.MEDIUM];
    await service.analyze(makeSnapshot(riskTolerances));
    expect(mockLlmClient.generateContent).toHaveBeenCalledTimes(1);
  });

  it('calls Gemini once per unique risk tolerance', async () => {
    mockResponseParser.parse
      .mockReturnValueOnce(makeRecommendation('AAPL', RiskTolerance.LOW))
      .mockReturnValueOnce(makeRecommendation('AAPL', RiskTolerance.HIGH));

    const riskTolerances = [RiskTolerance.LOW, RiskTolerance.HIGH, RiskTolerance.LOW];
    const result = await service.analyze(makeSnapshot(riskTolerances));
    expect(mockLlmClient.generateContent).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it('continues processing remaining groups when one risk group fails', async () => {
    mockLlmClient.generateContent
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce('raw');
    mockResponseParser.parse.mockReturnValueOnce(makeRecommendation('AAPL', RiskTolerance.HIGH));

    const riskTolerances = [RiskTolerance.LOW, RiskTolerance.HIGH];
    const result = await service.analyze(makeSnapshot(riskTolerances));
    expect(result).toHaveLength(1);
    expect(result[0].riskTolerance).toBe(RiskTolerance.HIGH);
  });

  it('returns empty array when all risk groups fail', async () => {
    mockLlmClient.generateContent.mockRejectedValue(new Error('API down'));

    const riskTolerances = [RiskTolerance.LOW, RiskTolerance.HIGH];
    const result = await service.analyze(makeSnapshot(riskTolerances));
    expect(result).toEqual([]);
  });
});
