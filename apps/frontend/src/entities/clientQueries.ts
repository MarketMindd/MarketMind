import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import type {
  AuthResponse,
  GetProfileResponse,
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

export type iClientQueriesProvider = {
  auth: {
    useSignIn: (
      options?: UseMutationOptions<AuthResponse, Error, SignInPayload>,
    ) => UseMutationResult<AuthResponse, Error, SignInPayload>;
    useSignUp: (
      options?: UseMutationOptions<AuthResponse, Error, SignUpPayload>,
    ) => UseMutationResult<AuthResponse, Error, SignUpPayload>;
    useSignOut: (
      options?: UseMutationOptions<void, Error, void>,
    ) => UseMutationResult<void, Error, void>;
  };
  profile: {
    useGetProfile: (
      options?: Omit<UseQueryOptions<GetProfileResponse, Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<GetProfileResponse, Error>;
    useUpdateProfile: (
      options?: UseMutationOptions<{ success: boolean }, Error, UpdateProfilePayload>,
    ) => UseMutationResult<{ success: boolean }, Error, UpdateProfilePayload>;
  };
  stocks: {
    useGetStock: (
      symbol: string,
      options?: Omit<UseQueryOptions<Stock, Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<Stock, Error>;
    useGetStocks: (
      symbols: string[],
      options?: Omit<UseQueryOptions<Stock[], Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<Stock[], Error>;
    useGetAllStocks: (
      options?: Omit<UseQueryOptions<Stock[], Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<Stock[], Error>;
    useGetBasicStocks: (
      options?: Omit<UseQueryOptions<Stock[], Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<Stock[], Error>;
  };
  portfolio: {
    usePortfolio: (
      options?: Omit<UseQueryOptions<PortfolioItemWithStock[], Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<PortfolioItemWithStock[], Error>;
    useSavePortfolio: (
      options?: UseMutationOptions<{ success: boolean }, Error, SavePortfolioPayload>,
    ) => UseMutationResult<{ success: boolean }, Error, SavePortfolioPayload>;
    useAiMarketSummary: (
      options?: Omit<UseQueryOptions<MarketSummaryResult, Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<MarketSummaryResult, Error>;
  };
  chat: {
    useGetChatSessions: (
      options?: Omit<UseQueryOptions<ChatSession[], Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<ChatSession[], Error>;
    useCreateChatSession: (
      options?: UseMutationOptions<ChatSession, Error, CreateChatSessionPayload>,
    ) => UseMutationResult<ChatSession, Error, CreateChatSessionPayload>;
    useDeleteChatSession: (
      options?: UseMutationOptions<{ success: boolean }, Error, string>,
    ) => UseMutationResult<{ success: boolean }, Error, string>;
    useGetChatMessages: (
      sessionId: string,
      options?: Omit<UseQueryOptions<ChatMessage[], Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<ChatMessage[], Error>;
    useSendChatMessage: (
      sessionId: string,
      options?: UseMutationOptions<ChatMessage, Error, SendMessagePayload>,
    ) => UseMutationResult<ChatMessage, Error, SendMessagePayload>;
  };
};
