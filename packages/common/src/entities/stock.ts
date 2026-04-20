import { StockRecommendation } from '@/index.js';

export interface Stock {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  recommendation: StockRecommendation;
  confidence: number;
  explanation: string;
  isPortfolioStock: boolean;
}
