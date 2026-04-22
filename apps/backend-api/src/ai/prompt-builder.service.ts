import { Injectable } from '@nestjs/common';
import { RiskTolerance } from '@market-mind/common';
import { FilteredSnapshot } from '../filter/filter.types.js';

const RISK_GUIDANCE: Record<RiskTolerance, string> = {
  [RiskTolerance.LOW]:
    'Prioritize capital preservation. Lean towards Hold or Exit unless the outlook is very strong.',
  [RiskTolerance.MEDIUM]:
    'Balance risk and reward. Consider both upside potential and downside risk equally.',
  [RiskTolerance.HIGH]:
    'Accept higher volatility for greater return potential. Lean towards Invest on positive signals.',
};

@Injectable()
export class PromptBuilderService {
  build(snapshot: FilteredSnapshot, riskTolerance: RiskTolerance): string {
    const { symbol, price, priceChange } = snapshot.snapshot;

    const newsSection =
      snapshot.news.length === 0
        ? 'No recent news articles found for this symbol.'
        : snapshot.news
            .map(
              (a) =>
                `- [${a.source}] ${a.title}${a.description ? `: ${a.description}` : ''}`,
            )
            .join('\n');

    return `You are a financial analysis assistant. Analyze the following market data and return a structured recommendation.

MARKET DATA:
- Symbol: ${symbol}
- Current Price: $${price}
- Price Change: ${priceChange.toFixed(2)}%

RECENT NEWS:
${newsSection}

RISK TOLERANCE: ${riskTolerance}
${RISK_GUIDANCE[riskTolerance]}

Respond with a JSON object only. No markdown, no explanation outside the JSON.
The JSON must have exactly these fields:
- "status": one of "Invest", "Hold", or "Exit"
- "confidence": a number between 0 and 1
- "rationale": a concise explanation of your recommendation`;
  }
}
