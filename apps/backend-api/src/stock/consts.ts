import type { AiResponse } from '@market-mind/common';

export const DEFAULT_STOCK_RECOMMENDATION: AiResponse = {
  status: 'Hold',
  confidence: 0,
  rationale: 'No recommendation available',
};
