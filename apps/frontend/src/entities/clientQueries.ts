import type {
  SignInPayload,
  SignUpPayload,
  UserProfile,
} from '@market-mind/common';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

export type iClientQueriesProvider = {
  auth: {
    useSignIn: (
      options?: UseMutationOptions<UserProfile, Error, SignInPayload>,
    ) => UseMutationResult<UserProfile, Error, SignInPayload>;
    useSignUp: (
      options?: UseMutationOptions<UserProfile, Error, SignUpPayload>,
    ) => UseMutationResult<UserProfile, Error, SignUpPayload>;
  };
};
