import {
  SignInPayload,
  SignUpPayload,
  UserProfile,
  AuthResponse,
} from "@market-mind/common";

export interface iDataProvider {
  auth: {
    signin: (payload: SignInPayload) => Promise<AuthResponse>;
    signup: (payload: SignUpPayload) => Promise<AuthResponse>;
  };
}
