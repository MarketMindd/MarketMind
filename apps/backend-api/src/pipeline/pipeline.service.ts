import { Injectable, Logger } from '@nestjs/common';
import { FilterService } from '../filter/filter.service.js';
import { AiService } from '../ai/ai.service.js';
import { MarketSnapshot } from '../market/market.types.js';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly filterService: FilterService,
    private readonly aiService: AiService,
  ) {}

  async process(snapshot: MarketSnapshot): Promise<void> {
    const filtered = await this.filterService.filter(snapshot);

    if (!filtered) return;

    this.logger.log(
      `Pipeline: ${snapshot.symbol} → AI (${filtered.users.length} users, ` +
        `${filtered.news.length} articles)`,
    );

    try {
      const recommendations = await this.aiService.analyze(filtered);
      this.logger.log(
        `Pipeline: ${snapshot.symbol} → ${recommendations.length} recommendation(s) generated`,
      );
    } catch (error) {
      this.logger.warn(
        `Pipeline: AI stage failed for ${snapshot.symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
