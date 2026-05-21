import { Injectable, Logger } from '@nestjs/common';
import { AiRecommendation, PortfolioItemWithStock, RiskTolerance } from '@market-mind/common';
import { FilteredSnapshot } from '../filter/filter.types';
import { GeminiClientService } from './gemini-client.service';
import { PromptBuilderService } from './prompt-builder.service';
import { ResponseParserService } from './response-parser.service';

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

  async generateMarketSummary(
    portfolio: PortfolioItemWithStock[],
    riskTolerance: RiskTolerance,
  ): Promise<string> {
    try {
      const prompt = this.promptBuilder.buildMarketSummaryPrompt(portfolio, riskTolerance);
      const rawText = await this.geminiClient.generateRecommendation(prompt, {
        type: 'object',
        properties: {
          summary: { type: 'string' },
        },
        required: ['summary'],
      });

      let text = rawText.trim();
      const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```$/);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      }

      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.summary === 'string') {
        return parsed.summary;
      }
      return 'Market summary unavailable at this time.';
    } catch (error) {
      this.logger.error(
        `Failed to generate market summary: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 'Market summary unavailable at this time.';
    }
  }
}
