import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PerformanceRecommendation,
  PerformanceResponse,
  PerformanceStats,
  StockRecommendation,
} from '@market-mind/common';
import { MarketDataEntity, RecommendationHistoryEntity, StockEntity } from '@market-mind/database';

// A Hold call is a bet that the stock won't move much. It's graded a Success if price
// stayed within this band, Miss if it swung beyond it in either direction.
const HOLD_STABILITY_THRESHOLD_PCT = 5;

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
    const recommendations = this.buildRecommendationRows(historyRows, companyNames, currentPrices);
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
      const entryPrice = Number(r.entryPrice);
      if (currentPrice === undefined || entryPrice === 0) return [];

      const returnPct = ((currentPrice - entryPrice) / entryPrice) * 100;

      return [
        {
          id: r.id,
          stockSymbol: r.stockSymbol,
          companyName: companyNames.get(r.stockSymbol) ?? r.stockSymbol,
          status: r.status as StockRecommendation,
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

  private computeOutcome(status: string, returnPct: number): 'Success' | 'Miss' | 'N/A' {
    if (returnPct === 0) return 'N/A';
    if (status === 'Invest') return returnPct > 0 ? 'Success' : 'Miss';
    if (status === 'Exit') return returnPct < 0 ? 'Success' : 'Miss';
    if (status === 'Hold') {
      return Math.abs(returnPct) <= HOLD_STABILITY_THRESHOLD_PCT ? 'Success' : 'Miss';
    }
    return 'N/A';
  }

  private computeStats(rows: PerformanceRecommendation[]): PerformanceStats {
    const gradedRows = rows.filter((r) => r.outcome !== 'N/A');
    const successCount = gradedRows.filter((r) => r.outcome === 'Success').length;
    const directionalCount = gradedRows.length;
    const successRate = directionalCount > 0 ? (successCount / directionalCount) * 100 : 0;
    const avgReturn =
      rows.length > 0 ? rows.reduce((sum, r) => sum + r.returnPct, 0) / rows.length : 0;
    const since = rows.length > 0 ? rows[rows.length - 1].date : new Date().toISOString();

    return { successRate, avgReturn, totalCalls: rows.length, successCount, directionalCount, since };
  }
}
