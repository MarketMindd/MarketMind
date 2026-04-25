import { SignInPayload, SignUpPayload } from '@market-mind/common';

import { appConfig } from '@/config/appConfig';
import { iDataProvider } from '@/entities/dataProvider';

export const createFetchDataProvider = (): iDataProvider => {
  const baseUrl = appConfig.apiBaseUrl;

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const signin = async (payload: SignInPayload) => {
    const res = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: getHeaders(),
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
      headers: getHeaders(),
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
