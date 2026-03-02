import type { UserProfile } from './auth';
import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

export type iClientQueriesProvider = {
  auth: {
    useSignIn: (
      options?: UseMutationOptions<
        UserProfile,
        Error,
        { email: string; password: string }
      >,
    ) => UseMutationResult<
      UserProfile,
      Error,
      { email: string; password: string }
    >;
    useSignUp: (
      options?: UseMutationOptions<
        UserProfile,
        Error,
        { email: string; password: string; fullName: string }
      >,
    ) => UseMutationResult<
      UserProfile,
      Error,
      { email: string; password: string; fullName: string }
    >;
  };
};
