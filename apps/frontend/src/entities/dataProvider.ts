import type {
  AuthResponse,
  ChatMessage,
  ChatSession,
  CreateChatSessionPayload,
  GoogleSignInPayload,
  MarketSummaryResult,
  OAuthResponse,
  PortfolioItemWithStock,
  SavePortfolioPayload,
  SendMessagePayload,
  SignInPayload,
  SignUpPayload,
  Stock,
  UpdateProfilePayload,
} from '@market-mind/common';

export interface iDataProvider {
  auth: {
    signin: (payload: SignInPayload) => Promise<AuthResponse>;
    signup: (payload: SignUpPayload) => Promise<AuthResponse>;
    googleSignin: (payload: GoogleSignInPayload) => Promise<OAuthResponse>;
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
  chat: {
    getSessions: () => Promise<ChatSession[]>;
    createSession: (payload: CreateChatSessionPayload) => Promise<ChatSession>;
    deleteSession: (id: string) => Promise<{ success: boolean }>;
    getMessages: (sessionId: string) => Promise<ChatMessage[]>;
    sendMessage: (sessionId: string, payload: SendMessagePayload) => Promise<ChatMessage>;
  };
}
