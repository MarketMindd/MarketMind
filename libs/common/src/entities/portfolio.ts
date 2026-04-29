import { z } from 'zod';

export const portfolioItemSchema = z.object({
  id: z.string().optional(),
  ticker: z.string(),
  shares: z.number().min(0).max(9999999999),
  avgPrice: z.number().min(0).max(9999999999),
});

export const savePortfolioPayloadSchema = z.object({
  items: z.array(portfolioItemSchema),
});

export type PortfolioItem = z.infer<typeof portfolioItemSchema>;
export type SavePortfolioPayload = z.infer<typeof savePortfolioPayloadSchema>;
