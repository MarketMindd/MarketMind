import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import {
  DIRECTIONAL_NOISE_THRESHOLD_PCT,
  HOLD_STABILITY_THRESHOLD_PCT,
  RecommendationOutcome,
  StockRecommendation,
} from '@market-mind/common';
import { MarketDataEntity, RecommendationHistoryEntity } from '@market-mind/database';

const FREEZE_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PerformanceRefreshService {
  private readonly logger = new Logger(PerformanceRefreshService.name);

  constructor(
    @InjectRepository(RecommendationHistoryEntity)
    private readonly historyRepo: Repository<RecommendationHistoryEntity>,
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepo: Repository<MarketDataEntity>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async refresh(): Promise<void> {
    const allRows = await this.historyRepo.find();
    const openRows = allRows.filter((r) => !r.isFrozen);
    if (openRows.length === 0) return;

    const nextRowById = this.mapNextRowById(allRows);
    const livePriceCache = new Map<string, Promise<number | undefined>>();

    const updates = await Promise.all(
      openRows.map((row) => this.resolveRowUpdate(row, nextRowById, livePriceCache)),
    );
    const changed = updates.filter((row): row is RecommendationHistoryEntity => row !== null);
    if (changed.length === 0) return;

    await this.historyRepo.save(changed);
    this.logger.log(`Refreshed ${changed.length} recommendation-history row(s)`);
  }

  private mapNextRowById(
    rows: RecommendationHistoryEntity[],
  ): Map<string, RecommendationHistoryEntity> {
    const byCall = new Map<string, RecommendationHistoryEntity[]>();
    for (const row of rows) {
      const key = `${row.stockSymbol}|${row.riskTolerance}`;
      const group = byCall.get(key);
      if (group) group.push(row);
      else byCall.set(key, [row]);
    }

    const nextRowById = new Map<string, RecommendationHistoryEntity>();
    for (const group of byCall.values()) {
      const sorted = [...group].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      for (let i = 0; i < sorted.length - 1; i++) {
        nextRowById.set(sorted[i].id, sorted[i + 1]);
      }
    }
    return nextRowById;
  }

  private async resolveRowUpdate(
    row: RecommendationHistoryEntity,
    nextRowById: Map<string, RecommendationHistoryEntity>,
    livePriceCache: Map<string, Promise<number | undefined>>,
  ): Promise<RecommendationHistoryEntity | null> {
    const entryPrice = Number(row.entryPrice);
    if (entryPrice === 0) return null;

    const nextRow = nextRowById.get(row.id);
    const deadline = row.createdAt.getTime() + FREEZE_WINDOW_MS;

    let evaluationPrice: number | undefined;
    let isFrozen = false;

    if (nextRow && nextRow.createdAt.getTime() <= deadline) {
      evaluationPrice = Number(nextRow.entryPrice);
      isFrozen = true;
    } else if (deadline <= Date.now()) {
      evaluationPrice = await this.resolvePriceAtOrBefore(row.stockSymbol, new Date(deadline));
      isFrozen = evaluationPrice !== undefined;
    } else {
      evaluationPrice = await this.resolveLivePrice(row.stockSymbol, livePriceCache);
    }

    if (evaluationPrice === undefined) return null;

    const returnPct = ((evaluationPrice - entryPrice) / entryPrice) * 100;

    row.currentPrice = evaluationPrice;
    row.returnPct = returnPct;
    row.outcome = this.computeOutcome(row.status, returnPct);
    row.isFrozen = isFrozen;
    return row;
  }

  private resolvePriceAtOrBefore(symbol: string, deadline: Date): Promise<number | undefined> {
    return this.marketDataRepo
      .findOne({
        where: { stockSymbol: symbol, time: LessThanOrEqual(deadline) },
        order: { time: 'DESC' },
      })
      .then((data) => (data ? Number(data.price) : undefined));
  }

  private resolveLivePrice(
    symbol: string,
    cache: Map<string, Promise<number | undefined>>,
  ): Promise<number | undefined> {
    const cached = cache.get(symbol);
    if (cached) return cached;

    const lookup = this.marketDataRepo
      .findOne({ where: { stockSymbol: symbol }, order: { time: 'DESC' } })
      .then((data) => (data ? Number(data.price) : undefined));
    cache.set(symbol, lookup);
    return lookup;
  }

  private computeOutcome(status: StockRecommendation, returnPct: number): RecommendationOutcome {
    if (returnPct === 0) return RecommendationOutcome.NOT_APPLICABLE;
    if (status === StockRecommendation.INVEST || status === StockRecommendation.EXIT) {
      if (Math.abs(returnPct) <= DIRECTIONAL_NOISE_THRESHOLD_PCT) {
        return RecommendationOutcome.NOT_APPLICABLE;
      }
      const movedUp = returnPct > 0;
      const calledUp = status === StockRecommendation.INVEST;
      return movedUp === calledUp ? RecommendationOutcome.SUCCESS : RecommendationOutcome.MISS;
    }
    if (status === StockRecommendation.HOLD) {
      return Math.abs(returnPct) <= HOLD_STABILITY_THRESHOLD_PCT
        ? RecommendationOutcome.SUCCESS
        : RecommendationOutcome.MISS;
    }
    return RecommendationOutcome.NOT_APPLICABLE;
  }
}
