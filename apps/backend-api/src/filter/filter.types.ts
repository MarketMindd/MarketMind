import { RiskTolerance } from '@market-mind/common';
import { MarketSnapshot } from '../market/market.types';

export interface NewsArticle {
  title: string;
  description: string | null;
  publishedAt: Date;
  source: string;
}

export interface UserContext {
  userId: string;
  riskTolerance: RiskTolerance;
}

export interface FilteredSnapshot {
  snapshot: MarketSnapshot;
  news: NewsArticle[];
  users: UserContext[];
}

export interface AlphaVantageFeedItem {
  title: string;
  summary: string;
  time_published: string;
  source_domain: string;
}

export interface AlphaVantageResponse {
  feed?: AlphaVantageFeedItem[];
}
