import type { UserProfile } from './auth';

export interface iDataProvider {
  auth: {
    signin: (payload: {
      email: string;
      password: string;
    }) => Promise<UserProfile>;
    signup: (payload: {
      email: string;
      password: string;
      fullName: string;
    }) => Promise<UserProfile>;
  };
}
