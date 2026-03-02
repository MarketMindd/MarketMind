import React, { createContext, useContext } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import type { iDataProvider } from '@/entities/dataProvider';
import type {
  SignInPayload,
  SignUpPayload,
  UserProfile,
} from '@market-mind/common';
import type { iClientQueriesProvider } from '@/entities/clientQueries';

type ClientQueriesContext = {
  dataProvider: iDataProvider;
};

const ClientQueriesDataContext = createContext<ClientQueriesContext | null>(
  null,
);

export const ClientQueriesProvider = ({
  dataProvider,
  children,
  queryClient,
}: {
  dataProvider: iDataProvider;
  children: React.ReactNode;
  queryClient?: QueryClient;
}) => {
  const client = queryClient ?? new QueryClient();
  return (
    <ClientQueriesDataContext.Provider value={{ dataProvider }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ClientQueriesDataContext.Provider>
  );
};

export const useClientQueries = (): iClientQueriesProvider => {
  const ctx = useContext(ClientQueriesDataContext);
  if (!ctx)
    throw new Error(
      'useClientQueries must be used within ClientQueriesProvider',
    );

  const useSignIn = (
    options?: UseMutationOptions<UserProfile, Error, SignInPayload>,
  ) => {
    return useMutation<UserProfile, Error, SignInPayload>({
      mutationFn: (payload) => ctx.dataProvider.auth.signin(payload),
      ...options,
    });
  };

  const useSignUp = (
    options?: UseMutationOptions<UserProfile, Error, SignUpPayload>,
  ) => {
    return useMutation<UserProfile, Error, SignUpPayload>({
      mutationFn: (payload) => ctx.dataProvider.auth.signup(payload),
      ...options,
    });
  };

  return { auth: { useSignIn, useSignUp } };
};
