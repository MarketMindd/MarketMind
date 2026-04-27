import type { AuthResponse, SignInPayload, SignUpPayload, Stock } from '@market-mind/common';

export interface iDataProvider {
  auth: {
    signin: (payload: SignInPayload) => Promise<AuthResponse>;
    signup: (payload: SignUpPayload) => Promise<AuthResponse>;
    signout: () => Promise<void>;
  };
  stocks: {
    getStock: (symbol: string) => Promise<Stock>;
  };
}
