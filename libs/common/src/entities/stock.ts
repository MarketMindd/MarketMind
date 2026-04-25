import { AiRecommendation } from './aiRecommendation';

export interface Stock {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  recommendation: AiRecommendation;
  confidence: number;
  isPortfolioStock: boolean;
  explanation: string;
}
