import type {
  AuthResponse,
  PortfolioItem,
  PortfolioItemWithStock,
  SavePortfolioPayload,
  SignInPayload,
  SignUpPayload,
  Stock,
} from '@market-mind/common';

export interface iDataProvider {
  auth: {
    signin: (payload: SignInPayload) => Promise<AuthResponse>;
    signup: (payload: SignUpPayload) => Promise<AuthResponse>;
    signout: () => Promise<void>;
  };
  stocks: {
    getStocks: (symbols: string[]) => Promise<Stock[]>;
    getAllStocks: () => Promise<Stock[]>;
  };
  portfolio: {
    getPortfolio: () => Promise<PortfolioItemWithStock[]>;
    savePortfolio: (payload: SavePortfolioPayload) => Promise<{ success: boolean }>;
  };
}
