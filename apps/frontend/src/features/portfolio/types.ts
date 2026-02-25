export interface PortfolioHolding {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  avgCost: number;
  current: number;
  gainLoss: number;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  holdings: PortfolioHolding[];
}

export interface AddHoldingRequest {
  symbol: string;
  companyName: string;
  shares: number;
  avgPrice: number;
}

export interface StockOption {
  symbol: string;
  companyName: string;
}
