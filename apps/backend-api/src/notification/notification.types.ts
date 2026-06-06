import { RecommendationStatus, RiskTolerance } from '@market-mind/common';

export interface RecommendationNotificationPayload {
  stockSymbol: string;
  riskTolerance: RiskTolerance;
  previousStatus: RecommendationStatus | null;
  newStatus: RecommendationStatus;
  rationale: string;
}
