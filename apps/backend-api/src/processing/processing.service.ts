import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiRecommendation } from '@market-mind/common';
import { RecommendationEntity } from '@market-mind/database';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectRepository(RecommendationEntity)
    private readonly recommendationRepo: Repository<RecommendationEntity>,
  ) {}

  async process(recommendations: AiRecommendation[]): Promise<void> {
    if (recommendations.length === 0) return;

    for (const rec of recommendations) {
      try {
        await this.recommendationRepo.upsert(
          {
            stockSymbol: rec.symbol,
            riskTolerance: rec.riskTolerance,
            status: rec.status,
            confidenceScore: rec.confidence,
            rationale: rec.rationale,
          },
          ['stockSymbol', 'riskTolerance'],
        );
        this.logger.log(`Persisted ${rec.symbol}/${rec.riskTolerance}: ${rec.status}`);
      } catch (error) {
        this.logger.warn(
          `Failed to persist ${rec.symbol}/${rec.riskTolerance}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
