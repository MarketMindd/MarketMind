import { iDataProvider } from '@/entities/dataProvider';
import { SignInPayload, SignUpPayload } from '@market-mind/common';

export const createFetchDataProvider = (): iDataProvider => {
  const baseUrl = 'http://localhost:3000/api';

  const signin = async (payload: SignInPayload) => {
    const res = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || 'Request failed');
    }
    return res.json();
  };

  const signup = async (payload: SignUpPayload) => {
    const res = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || 'Request failed');
    }
    return res.json();
  };

  return {
    auth: {
      signin,
      signup,
    },
  };
};
