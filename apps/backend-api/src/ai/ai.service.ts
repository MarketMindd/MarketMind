import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AiRecommendation,
  MarketSummaryResult,
  PortfolioItemWithStock,
  RiskTolerance,
  SectorInterest,
} from '@market-mind/common';
import { FilteredSnapshot } from '../filter/filter.types';
import { LLM_CLIENT, LlmClient } from './llm-client.interface';
import { PromptBuilderService } from './prompt-builder.service';
import { ResponseParserService } from './response-parser.service';

const STRIP_MARKDOWN_JSON_WRAPPER_REGEX = /^```(?:json)?\s*([\s\S]*?)```$/;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly promptBuilder: PromptBuilderService,
    @Inject(LLM_CLIENT) private readonly llmClient: LlmClient,
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
        const prompt = this.promptBuilder.buildRecommendationPrompt(filtered, riskTolerance);
        const rawText = await this.llmClient.generateContent(prompt);
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
    interests: SectorInterest[],
    availableStocks: string[],
  ): Promise<Pick<MarketSummaryResult, 'summary' | 'suggestedStocks'>> {
    const prompt = this.promptBuilder.buildMarketSummaryPrompt(
      portfolio,
      riskTolerance,
      interests,
      availableStocks,
    );
    const rawText = await this.llmClient.generateContent(prompt, {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        suggestedStocks: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['summary', 'suggestedStocks'],
    });

    let text = rawText.trim();
    const fenceMatch = text.match(STRIP_MARKDOWN_JSON_WRAPPER_REGEX);

    if (fenceMatch) {
      text = fenceMatch[1].trim();
    }

    const parsed = JSON.parse(text);
    return {
      summary: typeof parsed.summary === 'string'
        ? parsed.summary
        : 'Market summary unavailable at this time.',
      suggestedStocks: Array.isArray(parsed.suggestedStocks)
        ? parsed.suggestedStocks.filter((s: unknown) => typeof s === 'string')
        : [],
    };
  }
}
