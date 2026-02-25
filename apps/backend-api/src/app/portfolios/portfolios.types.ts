export interface PortfolioHoldingResponse {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  avgCost: number;
  current: number;
  gainLoss: number;
  updatedAt: string;
}

export interface PortfolioResponse {
  id: string;
  userId: string;
  holdings: PortfolioHoldingResponse[];
}
