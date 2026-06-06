import { Injectable } from '@nestjs/common';
import { PortfolioItemWithStock, RiskTolerance, SectorInterest } from '@market-mind/common';
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
- "rationale": a detailed explanation of your recommendation (3-5 sentences)
- "aiSummary": a single concise sentence (max 20 words) summarising the recommendation for a card preview
- "shortTermOutlook": 1-2 sentences on the near-term price outlook and catalysts (next 1-3 months)
- "longTermOutlook": 1-2 sentences on the long-term growth potential (1-2 year horizon)`;
  }

  buildMarketSummaryPrompt(
    portfolio: PortfolioItemWithStock[],
    riskTolerance: RiskTolerance,
    interests: SectorInterest[],
    availableStocks: string[],
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

    const interestsSection = interests.length > 0 ? interests.join(', ') : 'None specified';

    const stocksSection =
      availableStocks.length > 0 ? availableStocks.join('\n') : 'No stocks available.';

    return `You are a financial advisory AI. Your task is to provide an overarching "AI Market Summary" and personalized recommendations.

USER PROFILE:
- Risk Tolerance: ${riskTolerance}
- Risk Strategy: ${RISK_GUIDANCE[riskTolerance]}
- Interested Sectors: ${interestsSection}

CURRENT PORTFOLIO:
${portfolioSection}

AVAILABLE STOCKS TO CONSIDER:
${stocksSection}

INSTRUCTIONS:
1. Provide a very brief, general market overview based on your latest internal knowledge.
2. Provide personalized recommendations tailored specifically to the user's Risk Tolerance and their current holdings.
3. Explicitly, but briefly, explain your reasoning combining market knowledge and the user's data.
4. IMPORTANT: Address the user directly in the second person (e.g., "Based on your moderate risk profile..."). Do NOT refer to them in the third person.
5. Keep the summary CONCISE. Maximum 3-4 sentences.
6. From the AVAILABLE STOCKS list, pick 1-2 ticker symbols the user should look into. Choose stocks that align with their risk tolerance and sector interests, and that are NOT already in their portfolio. Return ONLY the raw ticker symbols (e.g., "AAPL", not "AAPL (Apple Inc - Technology)").

Respond with a JSON object only. No markdown, no explanation outside the JSON.
The JSON must have exactly these fields:
- "summary": a short, single-paragraph AI Market Summary speaking directly to the user.
- "suggestedStocks": an array of 1-2 ticker symbols from the available stocks list.`;
  }

  buildChatPrompt(
    profile: { riskTolerance: RiskTolerance; interests: SectorInterest[] },
    portfolio: PortfolioItemWithStock[],
    history: { role: 'user' | 'model'; content: string }[],
    latestMessage: string,
    stockContext?: {
      symbol: string;
      name: string;
      sector: string;
      price: number;
      priceChange: number;
      recommendationStatus?: string;
      recommendationRationale?: string;
      news: Array<{ title: string; source: string; description?: string }>;
    },
    shouldGenerateTitle?: boolean,
    marketRecommendations?: Array<{
      symbol: string;
      name: string;
      sector: string;
      status: string;
      confidence: number;
      summary?: string;
    }>,
  ): string {
    const portfolioText =
      portfolio.length === 0
        ? 'No active investments in portfolio.'
        : portfolio
            .map(
              (item) =>
                `- ${item.ticker}: ${item.shares} shares, Avg Cost: $${item.avgPrice.toFixed(2)}, Current Price: $${(item.stock?.marketData?.price || item.avgPrice).toFixed(2)}`,
            )
            .join('\n');

    const historyText = history
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    let stockSection = '';
    if (stockContext) {
      const newsSection =
        stockContext.news.length === 0
          ? 'No recent news available in system.'
          : stockContext.news
              .slice(0, 3)
              .map((n) => `- [${n.source}] ${n.title}`)
              .join('\n');

      const recSection = stockContext.recommendationStatus
        ? `- Latest System Recommendation: ${stockContext.recommendationStatus}\n- Recommendation Rationale: ${stockContext.recommendationRationale}`
        : "- Latest System Recommendation: No recommendation has been generated for this stock yet for the user's risk profile. This may be because the user is not currently tracking it.";

      stockSection = `
SELECTED STOCK CONTEXT (from system database):
- Symbol: ${stockContext.symbol}
- Name: ${stockContext.name}
- Sector: ${stockContext.sector}
- Current Price: $${stockContext.price} (${stockContext.priceChange.toFixed(2)}% change)
${recSection}
- Recent News:
${newsSection}
`;
    }

    const recommendationsText =
      !marketRecommendations || marketRecommendations.length === 0
        ? 'No system stock recommendations have been generated yet.'
        : marketRecommendations
            .map(
              (r) =>
                `- ${r.symbol} (${r.name}, ${r.sector}): ${r.status}, confidence ${(r.confidence * 100).toFixed(0)}%${r.summary ? ` — ${r.summary}` : ''}`,
            )
            .join('\n');

    let titleInstruction = '';
    if (shouldGenerateTitle) {
      titleInstruction =
        '\n6. IMPORTANT: Since this is the first user message in this chat session, you MUST also generate a suitable, very short title (2-4 words, e.g. "Apple Analysis" or "Portfolio Review") based on the user\'s message content. Return this title in the "title" field of the JSON response.';
    }

    const finalSchemaInstructions = shouldGenerateTitle
      ? 'Respond with a JSON object containing two fields: "reply" (string, markdown supported) and "title" (string, 2-4 words).'
      : 'Respond with a JSON object containing a single field "reply" (string, markdown supported).';

    return `You are "MarketMind AI", MarketMind's friendly, supportive AI financial assistant. Your goal is to explain market concepts, break down complex data, and discuss stock recommendations in simple terms for retail investors.

USER PROFILE:
- Risk Profile: ${profile.riskTolerance}
- Interested Sectors: ${profile.interests.join(', ') || 'None selected'}

USER PORTFOLIO:
${portfolioText}
${stockSection}

SYSTEM STOCK RECOMMENDATIONS (for your ${profile.riskTolerance} risk profile, ranked by confidence — use these when the user asks what to invest in):
${recommendationsText}

MARKETMIND WEBSITE STRUCTURE & CAPABILITIES:
- Dashboard (/dashboard): General overview, customized AI Market Summary, suggested stocks, watchlist of available stocks, and your current profile summary.
- Portfolio (/portfolio): Edit your stock holdings (shares owned, average purchase price), view total portfolio value, see net profit/loss, and view sector diversification pie charts.
- Stock Details (/stock/<SYMBOL>): Detailed page for any stock (e.g. /stock/AAPL). Features a TradingView interactive chart, latest news articles, dynamic AI recommendations (status: Invest/Hold/Exit, confidence, short-term and long-term outlook).
- Onboarding & Profile: Select your Risk Tolerance (Low/Medium/High) at /onboarding/risk-tolerance, and choose interested sectors (e.g. Technology, Healthcare, Energy, Financials, Consumer Discretionary) at /onboarding/interests.
- Chat (/chat): This chat screen where you can discuss stocks, ask financial questions, and get assistance.

CONVERSATION INSTRUCTIONS:
1. Speak in the second person ("you", "your portfolio"). Keep responses friendly, educational, and structured with clear paragraphs or bullet points. Do NOT start your message with boilerplate self-introductions (such as "Hello! As MarketMind AI, ..." or "I am MarketMind AI..."). Just answer the user's question directly and naturally.
2. DATA RULES (STRICT DATABASE GROUNDING):
   - All financial analysis and answers regarding the user's portfolio, holdings, or stock metrics MUST be strictly based on the injected database data. If the database does not contain information for a specific stock or query, clearly inform the user that it is not available in the database.
   - Use the data injected above (user profile, portfolio, stock context, and system stock recommendations) as your primary source of truth.
   - When the user asks for stock suggestions, "your best stocks", what to invest in, or to compare options, USE the SYSTEM STOCK RECOMMENDATIONS list above. Recommend the highest-confidence "Invest"-rated stocks (typically the top 3), citing each one's status and confidence. Do NOT claim you cannot recommend stocks while that list is non-empty.
   - If stock context is provided above, you SHOULD discuss it using whatever fields are available (price, sector, recommendation, etc.). If a recommendation has not been generated yet, say so honestly and discuss the stock using the price and sector data you do have.
   - If the user asks about a stock or topic for which NO context was injected above at all, clearly state that you don't have data on that specific stock in the system.
   - Do not invent stock prices, recommendations, or news that are not in the injected context.
3. If the user asks for financial advice (e.g., "should I buy AAPL?"), explain the facts from the data, refer to the system's recommendation status (if present), but strictly note that you are an AI assistant and this is not certified financial advice.
4. If the user asks questions completely unrelated to finance, investing, stocks, or their portfolio, politely redirect them back to financial topics.
5. WEBSITE ASSISTANCE:
   - If the user asks how to perform actions on the website (e.g., "where can I edit my holdings?", "how to change my risk tolerance?", "how to see Apple chart?"), use the WEBSITE STRUCTURE above to guide them precisely to the correct page or URL path.
6. You must format your reply using Markdown (headers, bold text, lists).${titleInstruction}

CONVERSATION HISTORY:
${historyText}

USER'S CURRENT MESSAGE:
${latestMessage}

${finalSchemaInstructions}`;
  }
}
