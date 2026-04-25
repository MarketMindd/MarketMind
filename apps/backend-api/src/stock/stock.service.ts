import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getStockBySymbol(symbol: Stock['symbol']): Promise<Stock> {
    console.log(`Fetching stock data for symbol: ${symbol}`);

    const rawData: RawStock | undefined = await this.stockRepo
      .createQueryBuilder('stocks')
      .leftJoin(
        RecommendationEntity,
        'recommendation',
        'recommendation.stockSymbol = stocks.symbol',
      )
      .innerJoin(MarketDataEntity, 'marketData', 'marketData.stockSymbol = stocks.symbol')
      .select([
        'stocks.symbol as symbol',
        'stocks.name as name',
        'stocks.sector as sector',
        'marketData.price as price',
        'marketData.volume as volume',
        'marketData.priceChange AS "priceChange"',
        'recommendation.status as status',
        'recommendation.confidenceScore AS "confidence"',
        'recommendation.rationale as rationale',
      ])
      .where('stocks.symbol = :symbol', { symbol })
      .orderBy('marketData.time', 'DESC')
      .addOrderBy('recommendation.createdAt', 'DESC')
      .getRawOne();

    if (!rawData) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }

    return this.mapStockEntityToStock(rawData);
  }

  private mapStockEntityToStock(rawStock: RawStock): Stock {
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
            confidence: Number(rawStock.confidence ?? 0) * 10,
            rationale: rawStock.rationale ?? '',
          }
        : DEFAULT_STOCK_RECOMMENDATION,
    };
  }
}
