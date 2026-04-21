import type {
  SignInPayload,
  SignUpPayload,
  AuthResponse,
} from '@market-mind/common';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

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
