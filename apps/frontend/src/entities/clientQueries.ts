import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type { AuthResponse, SignInPayload, SignUpPayload, Stock, PortfolioItem, SavePortfolioPayload } from '@market-mind/common';

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
  stocks: {
    useGetStock: (
      symbol: string,
      options?: Omit<UseQueryOptions<Stock, Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<Stock, Error>;
  };
  portfolio: {
    usePortfolio: (
      options?: Omit<UseQueryOptions<PortfolioItem[], Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<PortfolioItem[], Error>;
    useSavePortfolio: (
      options?: UseMutationOptions<{ success: boolean }, Error, SavePortfolioPayload>,
    ) => UseMutationResult<{ success: boolean }, Error, SavePortfolioPayload>;
  };
};
