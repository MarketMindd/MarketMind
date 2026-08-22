import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskTolerance, Stock } from '@market-mind/common';
import { StockEntity } from '@market-mind/database';
import { DEFAULT_STOCK_RECOMMENDATION } from './consts';
import type { RawStock } from './types';

const latestMarketDataJoin = (joinType: 'LEFT' | 'INNER') => `
  ${joinType} JOIN LATERAL (
    SELECT price, volume, "priceChange"
    FROM market_data
    WHERE market_data."stockSymbol" = stocks.symbol
    ORDER BY time DESC
    LIMIT 1
  ) "marketData" ON true
`;

const LATEST_RECOMMENDATION_JOIN = (riskToleranceParam: string) => `
  LEFT JOIN LATERAL (
    SELECT status, "confidenceScore", rationale, "aiSummary", "shortTermOutlook", "longTermOutlook"
    FROM recommendations
    WHERE recommendations."stockSymbol" = stocks.symbol
      AND (${riskToleranceParam}::text IS NULL OR recommendations."riskTolerance"::text = ${riskToleranceParam})
    ORDER BY "updatedAt" DESC
    LIMIT 1
  ) recommendation ON true
`;

const STOCK_WITH_RECOMMENDATION_SELECT = `
  stocks.symbol AS "symbol",
  stocks.name AS "name",
  stocks.sector AS "sector",
  "marketData".price AS "price",
  "marketData".volume AS "volume",
  "marketData"."priceChange" AS "priceChange",
  recommendation.status AS "status",
  recommendation."confidenceScore" AS "confidence",
  recommendation.rationale AS "rationale",
  recommendation."aiSummary" AS "aiSummary",
  recommendation."shortTermOutlook" AS "shortTermOutlook",
  recommendation."longTermOutlook" AS "longTermOutlook"
`;

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
  ) {}

  async getStocksBySymbols(symbols: string[], riskTolerance?: RiskTolerance): Promise<Stock[]> {
    if (!symbols || symbols.length === 0) return [];

    const rawData: RawStock[] = await this.stockRepo.query(
      `
        SELECT ${STOCK_WITH_RECOMMENDATION_SELECT}
        FROM stocks
        ${latestMarketDataJoin('INNER')}
        ${LATEST_RECOMMENDATION_JOIN('$2')}
        WHERE stocks.symbol = ANY($1)
      `,
      [symbols, riskTolerance ?? null],
    );

    return rawData.map((data) => this.mapRawStock(data));
  }

  async getAllStocks(riskTolerance?: RiskTolerance): Promise<Stock[]> {
    const rawData: RawStock[] = await this.stockRepo.query(
      `
        SELECT ${STOCK_WITH_RECOMMENDATION_SELECT}
        FROM stocks
        ${latestMarketDataJoin('LEFT')}
        ${LATEST_RECOMMENDATION_JOIN('$1')}
      `,
      [riskTolerance ?? null],
    );

    return rawData.map((data) => this.mapRawStock(data));
  }

  async getBasicStocks(): Promise<Stock[]> {
    const rawData = await this.stockRepo.query(`
      SELECT
        stocks.symbol AS "symbol",
        stocks.name AS "name",
        stocks.sector AS "sector",
        "marketData".price AS "price",
        "marketData".volume AS "volume",
        "marketData"."priceChange" AS "priceChange"
      FROM stocks
      ${latestMarketDataJoin('LEFT')}
    `);

    return rawData.map((data: RawStock) => this.mapRawStock({ ...data, status: null }));
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
