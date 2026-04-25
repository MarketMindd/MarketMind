import { AiResponse, MarketData, Stock } from '@market-mind/common';

export type RawStock = Omit<Stock, 'marketData' | 'aiRecommendation'> & MarketData & AiResponse;
