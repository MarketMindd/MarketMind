import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StockRecommendation, type Stock } from '@market-mind/common';
import { StockEntity } from '@market-mind/database';
import { DEFAULT_STOCK_RECOMMENDATION } from './consts';
import { StockService } from './stock.service';
import { RawStock } from './types';

describe('StockService', () => {
  let service: StockService;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    distinctOn: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: getRepositoryToken(StockEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStocksBySymbols', () => {
    it('should return empty array if no symbols provided', async () => {
      const result = await service.getStocksBySymbols([]);
      expect(result).toEqual([]);
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should return mapped stock with AI recommendation', async () => {
      const mockRawData: RawStock = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        price: '150.00',
        volume: '10000',
        priceChange: '2.50',
        status: StockRecommendation.INVEST,
        confidence: '0.8',
        rationale: 'Good financials',
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockRawData]);

      const result = await service.getStocksBySymbols(['AAPL']);

      const MOCK_STOCK: Stock = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        marketData: {
          price: 150,
          volume: 10000,
          priceChange: 2.5,
        },
        aiRecommendation: {
          status: StockRecommendation.INVEST,
          confidence: 80,
          rationale: 'Good financials',
        },
      };

      expect(result).toEqual([MOCK_STOCK]);
    });

    it('should return mapped stock with default recommendation if status is empty', async () => {
      const mockRawData: RawStock = {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        sector: 'Automotive',
        price: '200.00',
        volume: '5000',
        priceChange: '-1.50',
        status: null,
        confidence: null,
        rationale: null,
      };

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([mockRawData]);

      const result = await service.getStocksBySymbols(['TSLA']);

      const MOCK_STOCK: Stock = {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        sector: 'Automotive',
        marketData: {
          price: 200,
          volume: 5000,
          priceChange: -1.5,
        },
        aiRecommendation: DEFAULT_STOCK_RECOMMENDATION,
      };

      expect(result).toEqual([MOCK_STOCK]);
    });
  });
});
