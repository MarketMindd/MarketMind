import { Test, TestingModule } from '@nestjs/testing';
import { NetworkService } from '../network/network.service';
import { MassiveApiService } from './massive.service';

jest.mock('../config/appConfig', () => ({
  appConfig: {
    massiveApiKey: 'test-massive-key',
  },
}));

describe('MassiveApiService', () => {
  let service: MassiveApiService;
  let networkService: NetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MassiveApiService,
        {
          provide: NetworkService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MassiveApiService>(MassiveApiService);
    networkService = module.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNews', () => {
    it('should fetch and map news correctly with insights formatting', async () => {
      const publishedUtcStr = '2024-06-24T18:33:53Z';
      (networkService.get as jest.Mock).mockImplementation(async (url, mapper) => {
        const mockResponse = {
          results: [
            {
              title: 'Test Title 1',
              description: 'Test Description 1',
              published_utc: publishedUtcStr,
              publisher: { name: 'Test Source 1' },
              insights: [
                { sentiment: 'positive', sentiment_reasoning: 'Good news for AAPL', ticker: 'AAPL' },
                { sentiment: 'negative', sentiment_reasoning: 'Bad news for MSFT', ticker: 'MSFT' },
              ],
            },
            {
              title: 'Test Title 2',
              description: null,
              published_utc: publishedUtcStr,
              publisher: undefined,
              insights: [],
            },
          ],
        };
        return mapper(mockResponse);
      });

      const result = await service.getNews('AAPL');

      expect(networkService.get).toHaveBeenCalledWith(
        'https://api.massive.com/v2/reference/news?ticker=AAPL&limit=5&apiKey=test-massive-key',
        expect.any(Function),
      );

      expect(result).toEqual([
        {
          title: 'Test Title 1',
          description: 'Test Description 1\n\n--- Extracted Insights for AAPL ---\nSentiment: POSITIVE\nReasoning: Good news for AAPL',
          publishedAt: new Date(publishedUtcStr),
          source: 'Test Source 1',
        },
        {
          title: 'Test Title 2',
          description: null,
          publishedAt: new Date(publishedUtcStr),
          source: 'Massive API',
        },
      ]);
    });

    it('should return empty array on network error', async () => {
      (networkService.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      const result = await service.getNews('AAPL');
      expect(result).toEqual([]);
    });

    it('should handle missing results by returning empty array', async () => {
      (networkService.get as jest.Mock).mockImplementation(async (url, mapper) => mapper({}));
      const result = await service.getNews('AAPL');
      expect(result).toEqual([]);
    });
  });
});
