import z from 'zod';
import type { AiResponse } from './aiRecommendation';
import type { MarketData } from './marketData';

export interface Stock {
  name: string;
  symbol: string;
  sector: string;
  marketData: MarketData;
  aiRecommendation: AiResponse;
}

export const getSymbolsQuerySchema = z
  .string()
  .optional()
  .transform((val) => (val ? val.split(',').filter(Boolean) : []));
