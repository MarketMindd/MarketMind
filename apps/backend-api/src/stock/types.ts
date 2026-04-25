import { AiResponse, MarketData, Stock } from '@market-mind/common';

type UnMappedRawStock = Omit<Stock, 'marketData' | 'aiRecommendation'> & MarketData & AiResponse;

type Nullable<T, k extends keyof T> = {
  [P in keyof T]: P extends k ? T[P] | null : T[P];
};

type StringMapper<T extends Record<string, unknown>, keys extends keyof T> = {
  [Key in keyof T]: Key extends keys ? T[Key] : string;
};

export type RawStock = Nullable<
  StringMapper<UnMappedRawStock, 'status'>,
  'status' | 'confidence' | 'rationale'
>;
