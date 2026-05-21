import { Injectable } from '@nestjs/common';
import { PortfolioItemWithStock, RiskTolerance } from '@market-mind/common';
import { FilteredSnapshot } from '../filter/filter.types';

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
            .map((a) => `- [${a.source}] ${a.title}${a.description ? `: ${a.description}` : ''}`)
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

  buildMarketSummaryPrompt(
    portfolio: PortfolioItemWithStock[],
    riskTolerance: RiskTolerance,
  ): string {
    const portfolioSection =
      portfolio.length === 0
        ? 'No active investments in portfolio.'
        : portfolio
            .map((item) => {
              const currentPrice = item.stock?.marketData?.price || item.avgPrice;
              const gainLoss = (currentPrice - item.avgPrice) * item.shares;
              const sectorInfo = item.stock?.sector ? ` [Sector: ${item.stock.sector}]` : '';
              return `- ${item.ticker}${sectorInfo}: ${item.shares} shares, Avg Cost: $${item.avgPrice.toFixed(2)}, Current Price: $${currentPrice.toFixed(2)}, Gain/Loss: $${gainLoss.toFixed(2)}`;
            })
            .join('\n');

    return `You are a financial advisory AI. Your task is to provide an overarching "AI Market Summary" and personalized recommendations.

USER PROFILE:
- Risk Tolerance: ${riskTolerance}
- Risk Strategy: ${RISK_GUIDANCE[riskTolerance]}

CURRENT PORTFOLIO:
${portfolioSection}

INSTRUCTIONS:
1. Provide a very brief, general market overview based on your latest internal knowledge.
2. Provide personalized recommendations tailored specifically to the user's Risk Tolerance and their current holdings.
3. Explicitly, but briefly, explain your reasoning combining market knowledge and the user's data.
4. IMPORTANT: Address the user directly in the second person (e.g., "Based on your moderate risk profile..."). Do NOT refer to them in the third person.
5. Keep it CONCISE. Maximum 3-4 sentences. Example length and tone: "Based on your moderate risk profile and interest in technology, I recommend focusing on established tech leaders with strong cash flows. Microsoft and Apple remain top picks, while caution is advised on high-volatility names like Tesla. The market shows cautious optimism with the S&P 500 up 12% YTD."

Respond with a JSON object only. No markdown, no explanation outside the JSON.
The JSON must have exactly this field:
- "summary": a short, single-paragraph AI Market Summary speaking directly to the user.`;
  }
}
