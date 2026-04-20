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
  shortExplanation: string;
  longExplanation: string;
  shortTermInsight: string;
  longTermInsight: string;
  performanceIndicator: string;
  isPortfolioStock?: boolean;
}
