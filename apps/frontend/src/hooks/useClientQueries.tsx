import React, { createContext, useContext } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import type { iDataProvider } from '@/entities/dataProvider';
import type { UserProfile } from '@/entities/auth';
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
    options?: UseMutationOptions<
      UserProfile,
      Error,
      { email: string; password: string }
    >,
  ) => {
    return useMutation<UserProfile, Error, { email: string; password: string }>(
      {
        mutationFn: (payload) => ctx.dataProvider.auth.signin(payload),
        ...options,
      },
    );
  };

  const useSignUp = (
    options?: UseMutationOptions<
      UserProfile,
      Error,
      { email: string; password: string; fullName: string }
    >,
  ) => {
    return useMutation<
      UserProfile,
      Error,
      { email: string; password: string; fullName: string }
    >({
      mutationFn: (payload) => ctx.dataProvider.auth.signup(payload),
      ...options,
    });
  };

  return { auth: { useSignIn, useSignUp } };
};
