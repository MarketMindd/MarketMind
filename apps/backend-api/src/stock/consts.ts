import { StockRecommendation, type AiResponse } from '@market-mind/common';

export const DEFAULT_STOCK_RECOMMENDATION: AiResponse = {
  status: StockRecommendation.HOLD,
  confidence: 0,
  rationale: 'No recommendation available',
};
