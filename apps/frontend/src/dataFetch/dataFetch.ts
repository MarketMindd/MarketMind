import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { AuthResponse, SignInPayload, SignUpPayload } from '@market-mind/common';

import { appConfig } from '@/config/appConfig';
import { iDataProvider } from '@/entities/dataProvider';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setupRequestInterceptor = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

const setupResponseInterceptor = (apiClient: AxiosInstance, baseUrl: string) => {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => apiClient(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          return Promise.reject(error);
        }

        isRefreshing = true;

        try {
          const refreshRes = await axios.post<AuthResponse>(`${baseUrl}/auth/refresh`, {
            refreshToken,
          });

          const data = refreshRes.data;
          localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

          processQueue(null, data.accessToken);

          return apiClient(originalRequest);
        } catch (err) {
          processQueue(err as Error, null);
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          window.dispatchEvent(new Event('auth:unauthorized'));
          if (window.location.pathname !== '/signin') {
            window.location.href = '/signin';
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

export const createFetchDataProvider = (): iDataProvider => {
  const baseUrl = appConfig.apiBaseUrl;

  const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  setupRequestInterceptor(apiClient);
  setupResponseInterceptor(apiClient, baseUrl);

  const signin = async (payload: SignInPayload) => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/signin', payload);
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  };

  const signup = async (payload: SignUpPayload) => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/signup', payload);
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  };

  const getStock = async (symbol: string) => {
    try {
      const res = await apiClient.get(`/stocks/${symbol}`);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  };

  return {
    auth: {
      signin,
      signup,
    },
    stocks: {
      getStock,
    },
  };
};
