import { Injectable, Logger } from '@nestjs/common';
import { FilterService } from '../filter/filter.service.js';
import { MarketSnapshot } from '../market/market.types.js';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(private readonly filterService: FilterService) {}

  async process(snapshot: MarketSnapshot): Promise<void> {
    const filtered = await this.filterService.filter(snapshot);

    if (!filtered) return;

    this.logger.log(
      `Pipeline: ${snapshot.symbol} → AI (${filtered.users.length} users, ` +
        `${filtered.news.length} articles)`,
    );

    // TODO(Task 3): await this.aiService.analyze(filtered);
  }
}
