import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '@market-mind/common';
import { MarketDataEntity, RecommendationEntity, StockEntity } from '@market-mind/database';
import { DEFAULT_STOCK_RECOMMENDATION } from './consts';
import type { RawStock } from './types';

const INITIAL_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Communication Services' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial Services' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'HD', name: 'Home Depot', sector: 'Consumer Cyclical' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive' },
  { symbol: 'DIS', name: 'Walt Disney', sector: 'Communication Services' },
];

@Injectable()
export class StockService implements OnModuleInit {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.stockRepo.count();
    if (count === 0) {
      this.logger.log('Seeding initial stocks...');
      await this.stockRepo.save(INITIAL_STOCKS);
      this.logger.log(`Successfully seeded ${INITIAL_STOCKS.length} stocks.`);
    }
  }

  async getStocksBySymbols(symbols: string[]): Promise<Stock[]> {
    if (!symbols || symbols.length === 0) return [];

    const rawData: RawStock[] = await this.stockRepo
      .createQueryBuilder('stocks')
      .leftJoin(
        RecommendationEntity,
        'recommendation',
        'recommendation.stockSymbol = stocks.symbol',
      )
      .innerJoin(MarketDataEntity, 'marketData', 'marketData.stockSymbol = stocks.symbol')
      .select([
        'stocks.symbol as "symbol"',
        'stocks.name as "name"',
        'stocks.sector as "sector"',
        'marketData.price as "price"',
        'marketData.volume as "volume"',
        'marketData.priceChange AS "priceChange"',
        'recommendation.status as "status"',
        'recommendation.confidenceScore AS "confidence"',
        'recommendation.rationale as "rationale"',
      ])
      .where('stocks.symbol IN (:...symbols)', { symbols })
      .distinctOn(['stocks.symbol'])
      .orderBy('stocks.symbol')
      .addOrderBy('marketData.time', 'DESC')
      .addOrderBy('recommendation.updatedAt', 'DESC')
      .getRawMany();

    return rawData.map((data) => this.mapRawStock(data));
  }

  async getAllStocks(): Promise<Stock[]> {
    const rawData: RawStock[] = await this.stockRepo
      .createQueryBuilder('stocks')
      .leftJoin(
        RecommendationEntity,
        'recommendation',
        'recommendation.stockSymbol = stocks.symbol',
      )
      .leftJoin(MarketDataEntity, 'marketData', 'marketData.stockSymbol = stocks.symbol')
      .select([
        'stocks.symbol as "symbol"',
        'stocks.name as "name"',
        'stocks.sector as "sector"',
        'marketData.price as "price"',
        'marketData.volume as "volume"',
        'marketData.priceChange AS "priceChange"',
        'recommendation.status as "status"',
        'recommendation.confidenceScore AS "confidence"',
        'recommendation.rationale as "rationale"',
      ])
      .distinctOn(['stocks.symbol'])
      .orderBy('stocks.symbol')
      .addOrderBy('marketData.time', 'DESC')
      .addOrderBy('recommendation.updatedAt', 'DESC')
      .getRawMany();

    return rawData.map((data) => this.mapRawStock(data));
  }

  private mapRawStock(rawStock: RawStock): Stock {
    return {
      symbol: rawStock.symbol,
      name: rawStock.name,
      sector: rawStock.sector,
      marketData: {
        price: Number(rawStock.price ?? 0),
        volume: Number(rawStock.volume ?? 0),
        priceChange: Number(rawStock.priceChange ?? 0),
      },
      aiRecommendation: rawStock.status
        ? {
            status: rawStock.status,
            confidence: Number(rawStock.confidence ?? 0) * 100,
            rationale: rawStock.rationale ?? '',
          }
        : DEFAULT_STOCK_RECOMMENDATION,
    };
  }
}
