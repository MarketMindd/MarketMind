import { Test, TestingModule } from '@nestjs/testing';
import { NetworkService } from '../network/network.service';
import { NewsApiService } from './news-api.service';

jest.mock('../config/appConfig', () => ({
  appConfig: {
    newsApiKeys: ['test-news-key'],
  },
}));

describe('NewsApiService', () => {
  let service: NewsApiService;
  let networkService: NetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsApiService,
        {
          provide: NetworkService,
          useValue: {
            getWithKeyRotation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NewsApiService>(NewsApiService);
    networkService = module.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNews', () => {
    it('should fetch and map news correctly', async () => {
      const publishedAtStr = '2023-10-10T12:15:00Z';
      (networkService.getWithKeyRotation as jest.Mock).mockImplementation(
        async (keys, buildUrl, mapper) => {
          const mockResponse = {
            articles: [
              {
                title: 'Test Title 1',
                description: 'Test Description 1',
                publishedAt: publishedAtStr,
                source: { name: 'Test Source 1' },
              },
              {
                title: undefined,
                description: undefined,
                publishedAt: publishedAtStr,
                source: undefined,
              },
            ],
          };
          expect(buildUrl('test-news-key')).toBe(
            'https://newsapi.org/v2/everything?q=AAPL&pageSize=5&sortBy=publishedAt&language=en&apiKey=test-news-key',
          );
          return mapper(mockResponse);
        },
      );

      const result = await service.getNews('AAPL');

      expect(networkService.getWithKeyRotation).toHaveBeenCalledWith(
        ['test-news-key'],
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ cacheTtlMs: expect.any(Number) }),
      );

      expect(result).toEqual([
        {
          title: 'Test Title 1',
          description: 'Test Description 1',
          publishedAt: new Date(publishedAtStr),
          source: 'Test Source 1',
        },
        {
          title: '',
          description: null,
          publishedAt: new Date(publishedAtStr),
          source: 'NewsAPI',
        },
      ]);
    });

    it('should return empty array on network error', async () => {
      (networkService.getWithKeyRotation as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );
      const result = await service.getNews('AAPL');
      expect(result).toEqual([]);
    });

    it('should handle missing articles gracefully', async () => {
      (networkService.getWithKeyRotation as jest.Mock).mockImplementation(
        async (keys, buildUrl, mapper) => mapper({}),
      );
      const result = await service.getNews('AAPL');
      expect(result).toEqual([]);
    });
  });
});
