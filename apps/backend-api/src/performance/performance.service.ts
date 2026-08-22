import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PerformanceRecommendation,
  PerformanceResponse,
  PerformanceStats,
  RecommendationOutcome,
  StockRecommendation,
} from '@market-mind/common';
import { RecommendationHistoryEntity, StockEntity } from '@market-mind/database';

const DEFAULT_RECOMMENDATIONS_LIMIT = 100;

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(RecommendationHistoryEntity)
    private readonly historyRepo: Repository<RecommendationHistoryEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
  ) {}

  async getPerformance(
    riskTolerance?: string,
    limit: number = DEFAULT_RECOMMENDATIONS_LIMIT,
  ): Promise<PerformanceResponse> {
    const historyRows = await this.fetchHistory(riskTolerance);
    const companyNames = await this.resolveCompanyNames(this.extractUniqueSymbols(historyRows));
    const recommendations = this.buildRecommendationRows(historyRows, companyNames);
    const stats = this.computeStats(recommendations);

    return { stats, recommendations: recommendations.slice(0, limit) };
  }

  private fetchHistory(riskTolerance?: string): Promise<RecommendationHistoryEntity[]> {
    return this.historyRepo.query(
      `SELECT *
       FROM recommendation_history
       WHERE "currentPrice" IS NOT NULL
         AND "returnPct" IS NOT NULL
         AND outcome IS NOT NULL
         ${riskTolerance ? `AND "riskTolerance" = $1` : ''}
       ORDER BY "createdAt" DESC`,
      riskTolerance ? [riskTolerance] : [],
    );
  }

  private extractUniqueSymbols(rows: RecommendationHistoryEntity[]): string[] {
    return [...new Set(rows.map((r) => r.stockSymbol))];
  }

  private async resolveCompanyNames(symbols: string[]): Promise<Map<string, string>> {
    const stocks = await this.stockRepo.findBy({ symbol: In(symbols) });
    return new Map(stocks.map((s) => [s.symbol, s.name]));
  }

  private buildRecommendationRows(
    rows: RecommendationHistoryEntity[],
    companyNames: Map<string, string>,
  ): PerformanceRecommendation[] {
    return rows.flatMap((r) => {
      if (r.currentPrice === null || r.returnPct === null || r.outcome === null) return [];

      return [
        {
          id: r.id,
          stockSymbol: r.stockSymbol,
          companyName: companyNames.get(r.stockSymbol) ?? r.stockSymbol,
          status: r.status as StockRecommendation,
          riskTolerance: r.riskTolerance,
          date: new Date(r.createdAt).toISOString(),
          entryPrice: Number(r.entryPrice),
          currentPrice: Number(r.currentPrice),
          returnPct: Number(r.returnPct),
          outcome: r.outcome,
        },
      ];
    });
  }

  private computeStats(rows: PerformanceRecommendation[]): PerformanceStats {
    const gradedRows = rows.filter(
      (r) =>
        r.outcome !== RecommendationOutcome.NOT_APPLICABLE && r.status !== StockRecommendation.HOLD,
    );
    const successCount = gradedRows.filter(
      (r) => r.outcome === RecommendationOutcome.SUCCESS,
    ).length;
    const directionalCount = gradedRows.length;
    const successRate = directionalCount > 0 ? (successCount / directionalCount) * 100 : 0;
    const avgReturn =
      directionalCount > 0
        ? gradedRows.reduce((sum, r) => sum + r.returnPct, 0) / directionalCount
        : 0;
    const holdRows = rows.filter(
      (r) =>
        r.status === StockRecommendation.HOLD && r.outcome !== RecommendationOutcome.NOT_APPLICABLE,
    );
    const holdSuccessCount = holdRows.filter(
      (r) => r.outcome === RecommendationOutcome.SUCCESS,
    ).length;

    const since =
      rows.length > 0
        ? rows.reduce((earliest, r) => (r.date < earliest ? r.date : earliest), rows[0].date)
        : new Date().toISOString();

    return {
      successRate,
      avgReturn,
      totalCalls: rows.length,
      successCount,
      directionalCount,
      holdSuccessCount,
      holdGradedCount: holdRows.length,
      since,
    };
  }
}
