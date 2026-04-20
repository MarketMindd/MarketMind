import { Stock, StockRecommendation } from '@market-mind/common';

export const mockStocks: Stock[] = [
  {
    id: '1',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    sector: 'Technology',
    price: 178.52,
    change: 2.34,
    changePercent: 1.33,
    recommendation: StockRecommendation.INVEST,
    confidence: 87,
    explanation:
      'Strong services growth and AI integration potential make this a solid long-term play.',
    longExplanation:
      'Apple continues to demonstrate exceptional execution across its ecosystem. The Services segment shows consistent 15%+ YoY growth, while the upcoming AI features in iOS 18 position the company for a significant upgrade cycle. Supply chain diversification efforts reduce geopolitical risks.',
    shortTermInsight:
      'Expect volatility around earnings but support at $170. Target: $195 within 3 months.',
    longTermInsight:
      'Vision Pro ecosystem and AI integration could drive 20%+ growth over 2 years.',
    performanceIndicator: 'Strong momentum with institutional buying pressure',
  },
  {
    id: '2',
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    sector: 'Technology',
    price: 875.28,
    change: -12.45,
    changePercent: -1.4,
    recommendation: StockRecommendation.HOLD,
    confidence: 72,
    explanation:
      'Already priced for perfection. Wait for a better entry point.',
    longExplanation:
      'While NVIDIA dominates the AI chip market with 80%+ market share, current valuations reflect much of the growth potential. Competition from AMD and custom chips from major tech companies could pressure margins in 2025.',
    shortTermInsight:
      'High volatility expected. Consider adding on dips below $800.',
    longTermInsight:
      'Long-term AI infrastructure demand remains strong, but diversify within semis.',
    performanceIndicator: 'Neutral - high valuation vs strong fundamentals',
  },
  {
    id: '3',
    name: 'Johnson & Johnson',
    ticker: 'JNJ',
    sector: 'Healthcare',
    price: 156.78,
    change: 0.89,
    changePercent: 0.57,
    recommendation: StockRecommendation.INVEST,
    confidence: 81,
    explanation:
      'Defensive healthcare play with strong dividend yield and pipeline potential.',
    longExplanation:
      'Post-Kenvue spinoff, J&J is now a focused pharmaceutical and medtech company. The oncology and immunology pipelines show promise, while the 3%+ dividend provides downside protection in volatile markets.',
    shortTermInsight:
      'Stable performance expected. Dividend reinvestment recommended.',
    longTermInsight:
      'Undervalued relative to peers. Target: $180 within 18 months.',
    performanceIndicator: 'Steady accumulation phase',
  },
  {
    id: '4',
    name: 'Tesla Inc.',
    ticker: 'TSLA',
    sector: 'Consumer',
    price: 248.92,
    change: -8.23,
    changePercent: -3.2,
    recommendation: StockRecommendation.EXIT,
    confidence: 68,
    explanation:
      'Margin compression and increased competition warrant caution.',
    longExplanation:
      'Tesla faces significant headwinds: aggressive price cuts have compressed margins to historic lows, Chinese EV makers are gaining market share, and the Cybertruck rollout has been slower than expected. FSD progress remains uncertain.',
    shortTermInsight: 'Risk of further decline to $200 support level.',
    longTermInsight: 'Re-evaluate after Q2 earnings for margin recovery signs.',
    performanceIndicator: 'Downward pressure with selling momentum',
  },
  {
    id: '5',
    name: 'Microsoft Corporation',
    ticker: 'MSFT',
    sector: 'Technology',
    price: 378.91,
    change: 5.67,
    changePercent: 1.52,
    recommendation: StockRecommendation.INVEST,
    confidence: 91,
    explanation:
      'Azure + Copilot AI integration creates a powerful growth engine.',
    longExplanation:
      "Microsoft's strategic partnership with OpenAI and rapid Copilot integration across products positions it as the enterprise AI leader. Azure growth remains strong at 29% YoY, and the gaming segment adds diversification.",
    shortTermInsight:
      'Momentum building ahead of next earnings. Support at $360.',
    longTermInsight: 'Best-positioned big tech for enterprise AI monetization.',
    performanceIndicator: 'Strong uptrend with healthy volume',
  },
  {
    id: '6',
    name: 'Exxon Mobil',
    ticker: 'XOM',
    sector: 'Energy',
    price: 104.56,
    change: -1.23,
    changePercent: -1.16,
    recommendation: StockRecommendation.HOLD,
    confidence: 65,
    explanation:
      'Energy transition uncertainty but strong cash flows support dividend.',
    longExplanation:
      'Exxon benefits from elevated oil prices and the Pioneer acquisition strengthens Permian Basin assets. However, long-term demand uncertainty and ESG pressures create headwinds for multiple expansion.',
    shortTermInsight: 'Range-bound between $98-$110. Trade the range.',
    longTermInsight: 'Dividend remains safe but growth limited.',
    performanceIndicator: 'Consolidating in trading range',
  },
];
