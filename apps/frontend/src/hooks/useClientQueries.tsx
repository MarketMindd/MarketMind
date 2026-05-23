import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import React, { createContext, useContext, useState } from 'react';
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

  return {
    auth: { useSignIn, useSignUp, useSignOut },
    profile: { useUpdateProfile },
    stocks: { useGetStock, useGetStocks, useGetAllStocks },
    portfolio: { usePortfolio, useSavePortfolio, useAiMarketSummary },
  };
};
