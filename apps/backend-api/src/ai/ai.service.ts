import { Injectable, Logger } from '@nestjs/common';
import { AiRecommendation, RiskTolerance } from '@market-mind/common';
import { FilteredSnapshot } from '../filter/filter.types.js';
import { PromptBuilderService } from './prompt-builder.service.js';
import { GeminiClientService } from './gemini-client.service.js';
import { ResponseParserService } from './response-parser.service.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly promptBuilder: PromptBuilderService,
    private readonly geminiClient: GeminiClientService,
    private readonly responseParser: ResponseParserService,
  ) {}

  async analyze(filtered: FilteredSnapshot): Promise<AiRecommendation[]> {
    const symbol = filtered.snapshot.symbol;
    const uniqueRiskLevels = [
      ...new Set(filtered.users.map((u) => u.riskTolerance)),
    ] as RiskTolerance[];

    if (uniqueRiskLevels.length === 0) return [];

    const recommendations: AiRecommendation[] = [];

    for (const riskTolerance of uniqueRiskLevels) {
      try {
        const prompt = this.promptBuilder.build(filtered, riskTolerance);
        const rawText = await this.geminiClient.generateRecommendation(prompt);
        const recommendation = this.responseParser.parse(rawText, symbol, riskTolerance);
        recommendations.push(recommendation);
        this.logger.log(
          `AI: ${symbol}/${riskTolerance} → ${recommendation.status} (confidence=${recommendation.confidence.toFixed(2)})`,
        );
      } catch (error) {
        this.logger.warn(
          `AI failed for ${symbol}/${riskTolerance}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return recommendations;
  }
}
