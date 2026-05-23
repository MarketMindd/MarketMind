import type { RiskTolerance } from '../enums/risk-tolerance';
import type { SectorInterest } from '../enums/sector-interest';

export interface MarketSummaryResult {
  summary: string;
  suggestedStocks: string[];
  riskTolerance: RiskTolerance;
  interests: SectorInterest[];
}
