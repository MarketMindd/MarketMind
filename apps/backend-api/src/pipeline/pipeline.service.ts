import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { FilterService } from '../filter/filter.service';
import { MarketSnapshot } from '../market/market.types';
import { ProcessingService } from '../processing/processing.service';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly filterService: FilterService,
    private readonly aiService: AiService,
    private readonly processingService: ProcessingService,
  ) {}

  async process(snapshot: MarketSnapshot): Promise<void> {
    const filtered = await this.filterService.filter(snapshot);

    if (!filtered) return;

    this.logger.log(
      `Pipeline: ${snapshot.symbol} → AI (${filtered.riskTolerances.length} risk tiers, ` +
        `${filtered.news.length} articles)`,
    );

    try {
      const recommendations = await this.aiService.analyze(filtered);
      await this.processingService.process(recommendations);
      this.logger.log(
        `Pipeline: ${snapshot.symbol} → ${recommendations.length} recommendation(s) persisted`,
      );
    } catch (error) {
      this.logger.warn(
        `Pipeline: AI stage failed for ${snapshot.symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
