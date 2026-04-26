import { AiResponse, MarketData, Nullable, Stock, StringMapper } from '@market-mind/common';

type UnMappedRawStock = Omit<Stock, 'marketData' | 'aiRecommendation'> & MarketData & AiResponse;

export type RawStock = Nullable<
  StringMapper<UnMappedRawStock, 'status'>,
  'status' | 'confidence' | 'rationale'
>;
