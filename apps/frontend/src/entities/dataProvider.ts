import type {
  AuthResponse,
  MarketSummaryResult,
  PortfolioItemWithStock,
  SavePortfolioPayload,
  SignInPayload,
  SignUpPayload,
  Stock,
  UpdateProfilePayload,
} from '@market-mind/common';

export interface iDataProvider {
  auth: {
    signin: (payload: SignInPayload) => Promise<AuthResponse>;
    signup: (payload: SignUpPayload) => Promise<AuthResponse>;
    signout: () => Promise<void>;
  };
  profile: {
    updateProfile: (payload: UpdateProfilePayload) => Promise<{ success: boolean }>;
  };
  stocks: {
    getStocks: (symbols: string[]) => Promise<Stock[]>;
    getAllStocks: () => Promise<Stock[]>;
  };
  portfolio: {
    getPortfolio: () => Promise<PortfolioItemWithStock[]>;
    savePortfolio: (payload: SavePortfolioPayload) => Promise<{ success: boolean }>;
    getAiMarketSummary: () => Promise<MarketSummaryResult>;
  };
}
