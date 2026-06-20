import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '@market-mind/common';
import { MarketDataEntity, RecommendationEntity, StockEntity } from '@market-mind/database';
import { DEFAULT_STOCK_RECOMMENDATION } from './consts';
import type { RawStock } from './types';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
  ) {}

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
        'recommendation.aiSummary AS "aiSummary"',
        'recommendation.shortTermOutlook AS "shortTermOutlook"',
        'recommendation.longTermOutlook AS "longTermOutlook"',
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
        'recommendation.aiSummary AS "aiSummary"',
        'recommendation.shortTermOutlook AS "shortTermOutlook"',
        'recommendation.longTermOutlook AS "longTermOutlook"',
      ])
      .distinctOn(['stocks.symbol'])
      .orderBy('stocks.symbol')
      .addOrderBy('marketData.time', 'DESC')
      .addOrderBy('recommendation.updatedAt', 'DESC')
      .getRawMany();

    return rawData.map((data) => this.mapRawStock(data));
  }

  async getBasicStocks(): Promise<Stock[]> {
    const rawData = await this.stockRepo
      .createQueryBuilder('stocks')
      .leftJoin(MarketDataEntity, 'marketData', 'marketData.stockSymbol = stocks.symbol')
      .select([
        'stocks.symbol as "symbol"',
        'stocks.name as "name"',
        'stocks.sector as "sector"',
        'marketData.price as "price"',
        'marketData.volume as "volume"',
        'marketData.priceChange AS "priceChange"',
      ])
      .distinctOn(['stocks.symbol'])
      .orderBy('stocks.symbol')
      .addOrderBy('marketData.time', 'DESC')
      .getRawMany();

    return rawData.map((data) => this.mapRawStock({ ...data, status: null }));
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
            aiSummary: rawStock.aiSummary ?? undefined,
            shortTermOutlook: rawStock.shortTermOutlook ?? undefined,
            longTermOutlook: rawStock.longTermOutlook ?? undefined,
          }
        : DEFAULT_STOCK_RECOMMENDATION,
    };
  }
}
