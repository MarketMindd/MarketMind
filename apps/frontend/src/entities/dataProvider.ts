import type {
  AuthResponse,
  MarketSummaryResult,
  PortfolioItemWithStock,
  SavePortfolioPayload,
  SignInPayload,
  SignUpPayload,
  Stock,
  UpdateProfilePayload,
  ChatSession,
  ChatMessage,
  CreateChatSessionPayload,
  SendMessagePayload,
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
    getBasicStocks: () => Promise<Stock[]>;
  };
  portfolio: {
    getPortfolio: () => Promise<PortfolioItemWithStock[]>;
    savePortfolio: (payload: SavePortfolioPayload) => Promise<{ success: boolean }>;
    getAiMarketSummary: () => Promise<MarketSummaryResult>;
  };
  chat: {
    getSessions: () => Promise<ChatSession[]>;
    createSession: (payload: CreateChatSessionPayload) => Promise<ChatSession>;
    deleteSession: (id: string) => Promise<{ success: boolean }>;
    getMessages: (sessionId: string) => Promise<ChatMessage[]>;
    sendMessage: (sessionId: string, payload: SendMessagePayload) => Promise<ChatMessage>;
  };
}
