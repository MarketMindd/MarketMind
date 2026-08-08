import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiRecommendation, RecommendationStatus } from '@market-mind/common';
import {
  MarketDataEntity,
  RecommendationEntity,
  RecommendationHistoryEntity,
} from '@market-mind/database';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectRepository(RecommendationEntity)
    private readonly recommendationRepo: Repository<RecommendationEntity>,
    @InjectRepository(RecommendationHistoryEntity)
    private readonly historyRepo: Repository<RecommendationHistoryEntity>,
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepo: Repository<MarketDataEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async process(recommendations: AiRecommendation[]): Promise<void> {
    if (recommendations.length === 0) return;

    for (const rec of recommendations) {
      try {
        const existingRecommendation = await this.recommendationRepo.findOne({
          where: {
            stockSymbol: rec.symbol,
            riskTolerance: rec.riskTolerance,
          },
        });
        const previousStatus = existingRecommendation?.status ?? null;

        await this.recommendationRepo.upsert(
          {
            stockSymbol: rec.symbol,
            riskTolerance: rec.riskTolerance,
            status: rec.status,
            confidenceScore: rec.confidence,
            rationale: rec.rationale,
            aiSummary: rec.aiSummary,
            shortTermOutlook: rec.shortTermOutlook,
            longTermOutlook: rec.longTermOutlook,
          },
          ['stockSymbol', 'riskTolerance'],
        );
        this.logger.log(`Persisted ${rec.symbol}/${rec.riskTolerance}: ${rec.status}`);

        await this.insertHistoryIfChanged(rec);

        if (this.shouldNotify(previousStatus, rec.status)) {
          try {
            await this.notificationService.notifyRecommendationChange({
              stockSymbol: rec.symbol,
              riskTolerance: rec.riskTolerance,
              previousStatus,
              newStatus: rec.status,
              rationale: rec.rationale,
            });
          } catch (error) {
            this.logger.warn(
              `Failed to send notification for ${rec.symbol}/${rec.riskTolerance}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      } catch (error) {
        this.logger.warn(
          `Failed to persist ${rec.symbol}/${rec.riskTolerance}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async insertHistoryIfChanged(rec: AiRecommendation): Promise<void> {
    try {
      const lastHistory = await this.historyRepo.findOne({
        where: {
          stockSymbol: rec.symbol,
          riskTolerance: rec.riskTolerance,
        },
        order: { createdAt: 'DESC' },
      });

      if (lastHistory?.status === rec.status) return;

      const marketData = await this.marketDataRepo.findOne({
        where: { stockSymbol: rec.symbol },
        order: { time: 'DESC' },
      });

      if (!marketData) {
        this.logger.warn(`No market data found for ${rec.symbol}; skipping history insert`);
        return;
      }

      const historyRow = this.historyRepo.create({
        stockSymbol: rec.symbol,
        riskTolerance: rec.riskTolerance,
        status: rec.status,
        confidenceScore: rec.confidence,
        entryPrice: Number(marketData.price),
      });

      await this.historyRepo.save(historyRow);
      this.logger.log(`History: ${rec.symbol}/${rec.riskTolerance} -> ${rec.status}`);
    } catch (error) {
      this.logger.warn(
        `Failed to insert history for ${rec.symbol}/${rec.riskTolerance}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private shouldNotify(
    previousStatus: RecommendationStatus | null,
    newStatus: RecommendationStatus,
  ): boolean {
    return previousStatus === null || previousStatus !== newStatus;
  }
}
