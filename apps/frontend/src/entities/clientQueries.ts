import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type { AuthResponse, SignInPayload, SignUpPayload, Stock } from '@market-mind/common';

export type iClientQueriesProvider = {
  auth: {
    useSignIn: (
      options?: UseMutationOptions<AuthResponse, Error, SignInPayload>,
    ) => UseMutationResult<AuthResponse, Error, SignInPayload>;
    useSignUp: (
      options?: UseMutationOptions<AuthResponse, Error, SignUpPayload>,
    ) => UseMutationResult<AuthResponse, Error, SignUpPayload>;
  };
  stocks: {
    useGetStock: (
      symbol: string,
      options?: Omit<UseQueryOptions<Stock, Error>, 'queryKey' | 'queryFn'>,
    ) => UseQueryResult<Stock, Error>;
  };
};
