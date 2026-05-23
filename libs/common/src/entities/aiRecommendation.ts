import { z } from 'zod';
import { StockRecommendation } from '../enums/command';
import { RiskTolerance } from '../enums/risk-tolerance';

export const recommendationStatusSchema = z.enum(StockRecommendation);

export const aiResponseSchema = z.object({
  status: recommendationStatusSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
});

export const aiRecommendationSchema = aiResponseSchema.extend({
  symbol: z.string(),
  riskTolerance: z.enum(RiskTolerance),
  generatedAt: z.date(),
});

export type RecommendationStatus = z.infer<typeof recommendationStatusSchema>;
export type AiResponse = z.infer<typeof aiResponseSchema>;
export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;
