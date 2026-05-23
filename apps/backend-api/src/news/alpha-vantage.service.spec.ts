import { Test, TestingModule } from '@nestjs/testing';
import { NetworkService } from '../network/network.service';
import { AlphaVantageService } from './alpha-vantage.service';

jest.mock('../config/appConfig', () => ({
  appConfig: {
    alphaVantageApiKey: 'test-key',
  },
}));

describe('AlphaVantageService', () => {
  let service: AlphaVantageService;
  let networkService: NetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlphaVantageService,
        {
          provide: NetworkService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlphaVantageService>(AlphaVantageService);
    networkService = module.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNews', () => {
    it('should fetch and map news correctly', async () => {
      (networkService.get as jest.Mock).mockImplementation(async (url, mapper) => {
        const mockResponse = {
          feed: [
            {
              title: 'Test Title 1',
              summary: 'Test Summary 1',
              time_published: '20231010T121500',
              source_domain: 'SomeSource',
            },
            {
              title: 'Test Title 2',
              summary: null,
              time_published: '',
              source_domain: null,
            },
          ],
        };
        return mapper(mockResponse);
      });

      const result = await service.getNews('AAPL');

      expect(networkService.get).toHaveBeenCalledWith(
        'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&limit=5&sort=LATEST&apikey=test-key',
        expect.any(Function),
      );

      expect(result).toEqual([
        {
          title: 'Test Title 1',
          description: 'Test Summary 1',
          publishedAt: new Date('2023-10-10T12:15:00Z'),
          source: 'SomeSource',
        },
        {
          title: 'Test Title 2',
          description: null,
          publishedAt: expect.any(Date),
          source: 'Alpha Vantage',
        },
      ]);
    });

    it('should return empty array on network error', async () => {
      (networkService.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      const result = await service.getNews('AAPL');
      expect(result).toEqual([]);
    });

    it('should handle missing feed data by returning empty array', async () => {
      (networkService.get as jest.Mock).mockImplementation(async (url, mapper) => mapper({}));
      const result = await service.getNews('AAPL');
      expect(result).toEqual([]);
    });
  });
});
