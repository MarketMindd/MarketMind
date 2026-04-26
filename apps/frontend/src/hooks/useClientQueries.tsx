import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import React, { createContext, useContext, useState } from 'react';

import type { AuthResponse, SignInPayload, SignUpPayload, Stock } from '@market-mind/common';

import type { iClientQueriesProvider } from '@/entities/clientQueries';
import type { iDataProvider } from '@/entities/dataProvider';

type ClientQueriesContext = {
  dataProvider: iDataProvider;
};

const ClientQueriesDataContext = createContext<ClientQueriesContext | null>(null);

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

  const useGetStock = (
    symbol: string,
    options?: Omit<UseQueryOptions<Stock, Error>, 'queryKey' | 'queryFn'>,
  ) => {
    return useQuery<Stock, Error>({
      queryKey: ['stock', symbol],
      queryFn: () => ctx.dataProvider.stocks.getStock(symbol),
      ...options,
    });
  };

  return { auth: { useSignIn, useSignUp }, stocks: { useGetStock } };
};
