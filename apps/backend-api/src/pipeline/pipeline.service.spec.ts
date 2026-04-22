import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service.js';
import { FilterService } from '../filter/filter.service.js';
import { AiService } from '../ai/ai.service.js';
import type { MarketSnapshot } from '../market/market.types.js';
import type { FilteredSnapshot } from '../filter/filter.types.js';
import { RiskTolerance } from '@market-mind/common';

const makeSnapshot = (): MarketSnapshot => ({
  symbol: 'AAPL',
  price: 150,
  priceChange: 2,
  volume: 1_000_000,
  fetchedAt: new Date(),
});

const makeFiltered = (): FilteredSnapshot => ({
  snapshot: makeSnapshot(),
  news: [],
  users: [{ userId: 'u1', riskTolerance: RiskTolerance.MEDIUM }],
});

describe('PipelineService', () => {
  let service: PipelineService;
  let mockFilterService: { filter: jest.Mock };
  let mockAiService: { analyze: jest.Mock };

  beforeEach(async () => {
    mockFilterService = { filter: jest.fn() };
    mockAiService = { analyze: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: FilterService, useValue: mockFilterService },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('does not call AI when filter returns null', async () => {
    mockFilterService.filter.mockResolvedValue(null);
    await service.process(makeSnapshot());
    expect(mockAiService.analyze).not.toHaveBeenCalled();
  });

  it('calls AI with the filtered snapshot when filter passes', async () => {
    const filtered = makeFiltered();
    mockFilterService.filter.mockResolvedValue(filtered);
    await service.process(makeSnapshot());
    expect(mockAiService.analyze).toHaveBeenCalledWith(filtered);
  });

  it('completes without throwing when AI raises an unexpected error', async () => {
    mockFilterService.filter.mockResolvedValue(makeFiltered());
    mockAiService.analyze.mockRejectedValue(new Error('Unexpected AI error'));
    await expect(service.process(makeSnapshot())).resolves.toBeUndefined();
  });
});
