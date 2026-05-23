import { StockRecommendation, type AiResponse } from '@market-mind/common';

export const DEFAULT_STOCK_RECOMMENDATION: AiResponse = {
  status: StockRecommendation.NOT_ANALYZED,
  confidence: 0,
  rationale: 'This stock has not been analyzed yet. Add it to your portfolio to receive AI recommendations.',
};
