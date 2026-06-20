import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  ChatMessage,
  ChatSession,
  CreateChatSessionPayload,
  MarketSummaryResult,
  PortfolioItem,
  SavePortfolioPayload,
  SendMessagePayload,
  SignInPayload,
  SignUpPayload,
  UpdateProfilePayload,
} from '@market-mind/common';
import { appConfig } from '@/config/appConfig';
import { iDataProvider } from '@/entities/dataProvider';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_ID_KEY = 'userId';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> =
  [];

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
      localStorage.setItem(USER_ID_KEY, res.data.user.id);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  };

  const signup = async (payload: SignUpPayload) => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/signup', payload);
      localStorage.setItem(ACCESS_TOKEN_KEY, res.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, res.data.refreshToken);
      localStorage.setItem(USER_ID_KEY, res.data.user.id);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  };

  const getStocks = async (symbols: string[]) => {
    try {
      if (symbols.length === 0) return [];
      const res = await apiClient.get(`/stocks?symbols=${symbols.join(',')}`);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  };

  const getAllStocks = async () => {
    try {
      const res = await apiClient.get('/stocks');
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  };

  const getBasicStocks = async () => {
    try {
      const res = await apiClient.get('/stocks/basic');
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  };

  const signout = async () => {
    try {
      const userId = localStorage.getItem(USER_ID_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (userId && refreshToken) {
        await apiClient.post('/auth/logout', { userId, refreshToken });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    try {
      const res = await apiClient.patch<{ success: boolean }>('/profile', payload);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  };

  return {
    auth: {
      signin,
      signup,
      signout,
    },
    profile: {
      updateProfile,
    },
    stocks: {
      getStocks,
      getAllStocks,
      getBasicStocks,
    },
    portfolio: {
      getPortfolio: async () => {
        const res = await apiClient.get<PortfolioItem[]>('/portfolio');
        return res.data;
      },
      savePortfolio: async (payload: SavePortfolioPayload) => {
        const res = await apiClient.put<{ success: boolean }>('/portfolio', payload);
        return res.data;
      },
      getAiMarketSummary: async () => {
        const res = await apiClient.get<MarketSummaryResult>('/portfolio/market-summary');
        return res.data;
      },
    },
    chat: {
      getSessions: async () => {
        const res = await apiClient.get<ChatSession[]>('/chat/sessions');
        return res.data;
      },
      createSession: async (payload: CreateChatSessionPayload) => {
        const res = await apiClient.post<ChatSession>('/chat/sessions', payload);
        return res.data;
      },
      deleteSession: async (id: string) => {
        const res = await apiClient.delete<{ success: boolean }>(`/chat/sessions/${id}`);
        return res.data;
      },
      getMessages: async (sessionId: string) => {
        const res = await apiClient.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
        return res.data;
      },
      sendMessage: async (sessionId: string, payload: SendMessagePayload) => {
        try {
          const res = await apiClient.post<ChatMessage>(
            `/chat/sessions/${sessionId}/messages`,
            payload,
          );
          return res.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
              throw new Error('MarketMind AI is currently busy. Please wait a moment and try again.');
            }
            throw new Error(error.response?.data?.message || 'Failed to send message');
          }
          throw error;
        }
      },
    },
  };
};
