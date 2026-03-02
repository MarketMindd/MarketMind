import { SignInPayload, SignUpPayload, UserProfile } from "@market-mind/common";

export interface iDataProvider {
  auth: {
    signin: (payload: SignInPayload) => Promise<UserProfile>;
    signup: (payload: SignUpPayload) => Promise<UserProfile>;
  };
}
