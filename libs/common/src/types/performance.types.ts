import { z } from 'zod';
import { StockRecommendation } from '../enums/command';
import { RecommendationOutcome } from '../enums/recommendation-outcome';
import { RiskTolerance } from '../enums/risk-tolerance';

// Invest/Exit are directional bets, so they are only graded once the price has moved further
// than this band. Inside it the move is indistinguishable from noise and the call stays
// ungraded rather than counting as a free win.
export const DIRECTIONAL_NOISE_THRESHOLD_PCT = 1;

export interface PerformanceRecommendation {
  id: string;
  stockSymbol: string;
  companyName: string;
  status: StockRecommendation;
  riskTolerance: RiskTolerance;
  date: string;
  entryPrice: number;
  currentPrice: number;
  returnPct: number;
  outcome: RecommendationOutcome;
}

export interface PerformanceStats {
  successRate: number;
  avgReturn: number;
  totalCalls: number;
  successCount: number;
  directionalCount: number;
  holdSuccessCount: number;
  holdGradedCount: number;
  since: string;
}

export interface PerformanceResponse {
  stats: PerformanceStats;
  recommendations: PerformanceRecommendation[];
}

export const performanceRecommendationSchema = z.object({
  id: z.string().uuid(),
  stockSymbol: z.string().max(20),
  companyName: z.string(),
  status: z.enum(StockRecommendation),
  riskTolerance: z.nativeEnum(RiskTolerance),
  date: z.string(),
  entryPrice: z.number(),
  currentPrice: z.number(),
  returnPct: z.number(),
  outcome: z.nativeEnum(RecommendationOutcome),
});

export const performanceResponseSchema = z.object({
  stats: z.object({
    successRate: z.number().min(0).max(100),
    avgReturn: z.number(),
    totalCalls: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    directionalCount: z.number().int().nonnegative(),
    holdSuccessCount: z.number().int().nonnegative(),
    holdGradedCount: z.number().int().nonnegative(),
    since: z.string(),
  }),
  recommendations: z.array(performanceRecommendationSchema),
});
