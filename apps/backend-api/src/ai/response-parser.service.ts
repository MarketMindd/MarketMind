import { Injectable } from '@nestjs/common';
import { aiResponseSchema, AiRecommendation, RiskTolerance } from '@market-mind/common';

@Injectable()
export class ResponseParserService {
  parse(rawText: string, symbol: string, riskTolerance: RiskTolerance): AiRecommendation {
    let text = rawText.trim();

    // Strip fenced JSON blocks if the model returns them despite structured output config
    const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```$/);
    if (fenceMatch) {
      text = fenceMatch[1].trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(
        `AI returned invalid JSON for ${symbol}/${riskTolerance}: ${text.slice(0, 200)}`,
      );
    }

    const result = aiResponseSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(
        `AI response failed schema validation for ${symbol}/${riskTolerance}: ${result.error.message}`,
      );
    }

    return {
      ...result.data,
      symbol,
      riskTolerance,
      generatedAt: new Date(),
    };
  }
}
