import { RecommendationStatus } from './aiRecommendation';

export interface PortfolioStock {
  ticker: string;
  shares: number;
  avgPrice: number;
}

export interface PastRecommendation {
  id: string;
  ticker: string;
  name: string;
  recommendation: RecommendationStatus;
  dateGiven: string;
  priceAtRecommendation: number;
  currentPrice: number;
  outcome: 'success' | 'miss';
  returnPercent: number;
}
