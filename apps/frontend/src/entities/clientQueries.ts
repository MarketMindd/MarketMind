import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import type { AuthResponse, SignInPayload, SignUpPayload } from '@market-mind/common';

export type iClientQueriesProvider = {
  auth: {
    useSignIn: (
      options?: UseMutationOptions<AuthResponse, Error, SignInPayload>,
    ) => UseMutationResult<AuthResponse, Error, SignInPayload>;
    useSignUp: (
      options?: UseMutationOptions<AuthResponse, Error, SignUpPayload>,
    ) => UseMutationResult<AuthResponse, Error, SignUpPayload>;
  };
};
