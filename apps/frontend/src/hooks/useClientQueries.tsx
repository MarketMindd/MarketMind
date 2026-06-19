import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import React, { createContext, useContext, useState } from 'react';
import type {
  AuthResponse,
  ChatMessage,
  ChatSession,
  CreateChatSessionPayload,
  GoogleSignInPayload,
  MarketSummaryResult,
  PortfolioItemWithStock,
  SavePortfolioPayload,
  SendMessagePayload,
  SignInPayload,
  SignUpPayload,
  Stock,
  UpdateProfilePayload,
} from '@market-mind/common';
import type { iClientQueriesProvider } from '@/entities/clientQueries';
import type { iDataProvider } from '@/entities/dataProvider';

type ClientQueriesContext = {
  dataProvider: iDataProvider;
};

export const ClientQueriesDataContext = createContext<ClientQueriesContext | null>(null);

export const ClientQueriesProvider = ({
  dataProvider,
  children,
  queryClient,
}: {
  dataProvider: iDataProvider;
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => {
  const [client] = useState(queryClient ?? new QueryClient());
  return (
    <ClientQueriesDataContext.Provider value={{ dataProvider }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ClientQueriesDataContext.Provider>
  );
};

export const useClientQueries = (): iClientQueriesProvider => {
  const ctx = useContext(ClientQueriesDataContext);
  if (!ctx) throw new Error('useClientQueries must be used within ClientQueriesProvider');

  const useSignIn = (options?: UseMutationOptions<AuthResponse, Error, SignInPayload>) => {
    return useMutation<AuthResponse, Error, SignInPayload>({
      mutationFn: (payload) => ctx.dataProvider.auth.signin(payload),
      ...options,
    });
  };

  const useSignUp = (options?: UseMutationOptions<AuthResponse, Error, SignUpPayload>) => {
    return useMutation<AuthResponse, Error, SignUpPayload>({
      mutationFn: (payload) => ctx.dataProvider.auth.signup(payload),
      ...options,
    });
  };

  const useGoogleSignIn = (
    options?: UseMutationOptions<AuthResponse, Error, GoogleSignInPayload>,
  ) => {
    return useMutation<AuthResponse, Error, GoogleSignInPayload>({
      mutationFn: (payload) => ctx.dataProvider.auth.googleSignin(payload),
      ...options,
    });
  };

  const useSignOut = (options?: UseMutationOptions<void, Error, void>) => {
    return useMutation<void, Error, void>({
      mutationFn: () => ctx.dataProvider.auth.signout(),
      ...options,
    });
  };

  const useUpdateProfile = (
    options?: UseMutationOptions<{ success: boolean }, Error, UpdateProfilePayload>,
  ) => {
    return useMutation<{ success: boolean }, Error, UpdateProfilePayload>({
      mutationFn: (payload) => ctx.dataProvider.profile.updateProfile(payload),
      ...options,
    });
  };

  const useGetStock = (
    symbol: string,
    options?: Omit<UseQueryOptions<Stock, Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<Stock, Error>({
      queryKey: ['stock', symbol],
      queryFn: async () => {
        const res = await ctx.dataProvider.stocks.getStocks([symbol]);
        if (!res || res.length === 0) throw new Error('Stock not found');
        return res[0];
      },
      ...options,
    });
  };

  const useGetStocks = (
    symbols: string[],
    options?: Omit<UseQueryOptions<Stock[], Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<Stock[], Error>({
      queryKey: ['stocks', symbols],
      queryFn: async () => {
        if (!ctx.dataProvider || symbols.length === 0) return [];
        return ctx.dataProvider.stocks.getStocks(symbols);
      },
      enabled: symbols.length > 0 && !!ctx.dataProvider,
      ...options,
    });
  };

  const useGetAllStocks = (
    options?: Omit<UseQueryOptions<Stock[], Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<Stock[], Error>({
      queryKey: ['allStocks'],
      queryFn: async () => {
        if (!ctx.dataProvider) return [];
        return ctx.dataProvider.stocks.getAllStocks();
      },
      enabled: !!ctx.dataProvider,
      ...options,
    });
  };

  const usePortfolio = (
    options?: Omit<UseQueryOptions<PortfolioItemWithStock[], Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<PortfolioItemWithStock[], Error>({
      queryKey: ['portfolio'],
      queryFn: () => ctx.dataProvider.portfolio.getPortfolio(),
      ...options,
    });
  };

  const useSavePortfolio = (
    options?: UseMutationOptions<{ success: boolean }, Error, SavePortfolioPayload>,
  ) => {
    return useMutation<{ success: boolean }, Error, SavePortfolioPayload>({
      mutationFn: (payload) => ctx.dataProvider.portfolio.savePortfolio(payload),
      ...options,
    });
  };

  const useAiMarketSummary = (
    options?: Omit<UseQueryOptions<MarketSummaryResult, Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<MarketSummaryResult, Error>({
      queryKey: ['portfolio', 'market-summary'],
      queryFn: () => ctx.dataProvider.portfolio.getAiMarketSummary(),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      ...options,
    });
  };

  const useGetChatSessions = (
    options?: Omit<UseQueryOptions<ChatSession[], Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<ChatSession[], Error>({
      queryKey: ['chatSessions'],
      queryFn: () => ctx.dataProvider.chat.getSessions(),
      ...options,
    });
  };

  const useCreateChatSession = (
    options?: UseMutationOptions<ChatSession, Error, CreateChatSessionPayload>,
  ) => {
    const queryClient = useQueryClient();
    return useMutation<ChatSession, Error, CreateChatSessionPayload>({
      mutationFn: (payload) => ctx.dataProvider.chat.createSession(payload),
      ...options,
      onSuccess: (data, variables, onMutateResult, context) => {
        queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
        if (options?.onSuccess) {
          options.onSuccess(data, variables, onMutateResult, context);
        }
      },
    });
  };

  const useDeleteChatSession = (
    options?: UseMutationOptions<{ success: boolean }, Error, string>,
  ) => {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean }, Error, string>({
      mutationFn: (id) => ctx.dataProvider.chat.deleteSession(id),
      ...options,
      onSuccess: (data, variables, onMutateResult, context) => {
        queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
        if (options?.onSuccess) {
          options.onSuccess(data, variables, onMutateResult, context);
        }
      },
    });
  };

  const useGetChatMessages = (
    sessionId: string,
    options?: Omit<UseQueryOptions<ChatMessage[], Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<ChatMessage[], Error>({
      queryKey: ['chatMessages', sessionId],
      queryFn: () => ctx.dataProvider.chat.getMessages(sessionId),
      enabled: !!sessionId,
      ...options,
    });
  };

  const useSendChatMessage = (
    sessionId: string,
    options?: UseMutationOptions<ChatMessage, Error, SendMessagePayload, unknown>,
  ) => {
    const queryClient = useQueryClient();
    return useMutation<
      ChatMessage,
      Error,
      SendMessagePayload,
      { previousMessages?: ChatMessage[] }
    >({
      mutationFn: (payload) => ctx.dataProvider.chat.sendMessage(sessionId, payload),
      onMutate: async (payload) => {
        // Cancel outgoing refetches so they don't overwrite our optimistic update
        await queryClient.cancelQueries({ queryKey: ['chatMessages', sessionId] });

        // Snapshot previous messages
        const previousMessages = queryClient.getQueryData<ChatMessage[]>([
          'chatMessages',
          sessionId,
        ]);

        // Optimistically add the user message
        const optimisticMessage: ChatMessage = {
          id: `optimistic-${Date.now()}`,
          sessionId,
          role: 'user',
          content: payload.content,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<ChatMessage[]>(['chatMessages', sessionId], (old = []) => [
          ...old,
          optimisticMessage,
        ]);

        return { previousMessages };
      },
      ...(options as UseMutationOptions<
        ChatMessage,
        Error,
        SendMessagePayload,
        { previousMessages?: ChatMessage[] }
      >),
      onError: (err, variables, context, invalidate) => {
        // Roll back on error
        queryClient.setQueryData(['chatMessages', sessionId], context?.previousMessages ?? []);
        if (options?.onError) {
          options.onError(err, variables, context, invalidate);
        }
      },
      onSettled: (data, error, variables, onMutateResult, context) => {
        // Always refetch after mutation to sync with server (gets the AI reply and updated session details)
        queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
        queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
        if (options?.onSettled) {
          options.onSettled(data, error, variables, onMutateResult, context);
        }
      },
      onSuccess: (data, variables, onMutateResult, context) => {
        if (options?.onSuccess) {
          options.onSuccess(data, variables, onMutateResult, context);
        }
      },
    });
  };

  return {
    auth: { useSignIn, useSignUp, useGoogleSignIn, useSignOut },
    profile: { useUpdateProfile },
    stocks: { useGetStock, useGetStocks, useGetAllStocks },
    portfolio: { usePortfolio, useSavePortfolio, useAiMarketSummary },
    chat: {
      useGetChatSessions,
      useCreateChatSession,
      useDeleteChatSession,
      useGetChatMessages,
      useSendChatMessage,
    },
  };
};
