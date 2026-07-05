import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  PerformanceRecommendation,
  PerformanceResponse,
  PerformanceStats,
} from '@market-mind/common';
import {
  MarketDataEntity,
  RecommendationHistoryEntity,
  StockEntity,
} from '@market-mind/database';
import { In, Repository } from 'typeorm';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(RecommendationHistoryEntity)
    private readonly historyRepo: Repository<RecommendationHistoryEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepo: Repository<MarketDataEntity>,
  ) {}

  async getPerformance(userId: string): Promise<PerformanceResponse> {
    void userId;

    const historyRows = await this.fetchAllHistory();
    const symbols = this.extractUniqueSymbols(historyRows);
    const [companyNames, currentPrices] = await Promise.all([
      this.resolveCompanyNames(symbols),
      this.resolveCurrentPrices(symbols),
    ]);
    const recommendations = this.buildRecommendationRows(
      historyRows,
      companyNames,
      currentPrices,
    );
    const stats = this.computeStats(recommendations);

    return { stats, recommendations };
  }

  private fetchAllHistory(): Promise<RecommendationHistoryEntity[]> {
    return this.historyRepo.find({ order: { createdAt: 'DESC' } });
  }

  private extractUniqueSymbols(rows: RecommendationHistoryEntity[]): string[] {
    return [...new Set(rows.map((r) => r.stockSymbol))];
  }

  private async resolveCompanyNames(symbols: string[]): Promise<Map<string, string>> {
    const stocks = await this.stockRepo.findBy({ symbol: In(symbols) });
    return new Map(stocks.map((s) => [s.symbol, s.name]));
  }

  private async resolveCurrentPrices(symbols: string[]): Promise<Map<string, number>> {
    const results = await Promise.all(
      symbols.map((sym) =>
        this.marketDataRepo.findOne({
          where: { stockSymbol: sym },
          order: { time: 'DESC' },
        }),
      ),
    );
    const priceMap = new Map<string, number>();
    symbols.forEach((sym, i) => {
      const result = results[i];
      if (result) priceMap.set(sym, Number(result.price));
    });
    return priceMap;
  }

  private buildRecommendationRows(
    rows: RecommendationHistoryEntity[],
    companyNames: Map<string, string>,
    currentPrices: Map<string, number>,
  ): PerformanceRecommendation[] {
    return rows.flatMap((r) => {
      const currentPrice = currentPrices.get(r.stockSymbol);
      if (currentPrice === undefined) return [];

      const entryPrice = Number(r.entryPrice);
      const returnPct = ((currentPrice - entryPrice) / entryPrice) * 100;

      return [
        {
          id: r.id,
          stockSymbol: r.stockSymbol,
          companyName: companyNames.get(r.stockSymbol) ?? r.stockSymbol,
          status: r.status as 'Invest' | 'Hold' | 'Exit',
          riskTolerance: r.riskTolerance,
          date: r.createdAt.toISOString(),
          entryPrice,
          currentPrice,
          returnPct,
          outcome: this.computeOutcome(r.status, returnPct),
        },
      ];
    });
  }

  private computeOutcome(status: string, returnPct: number): 'Success' | 'Miss' {
    if (status === 'Invest') return returnPct > 0 ? 'Success' : 'Miss';
    if (status === 'Exit') return returnPct < 0 ? 'Success' : 'Miss';
    return 'Success';
  }

  private computeStats(rows: PerformanceRecommendation[]): PerformanceStats {
    const directionalRows = rows.filter((r) => r.status !== 'Hold');
    const successCount = directionalRows.filter((r) => r.outcome === 'Success').length;
    const successRate =
      directionalRows.length > 0 ? (successCount / directionalRows.length) * 100 : 0;
    const avgReturn =
      rows.length > 0 ? rows.reduce((sum, r) => sum + r.returnPct, 0) / rows.length : 0;
    const since = rows.length > 0 ? rows[rows.length - 1].date : new Date().toISOString();

    return { successRate, avgReturn, totalCalls: rows.length, since };
  }
}
