import { AddHoldingRequest, Portfolio } from '../types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000';

const buildUrl = (path: string): string => `${API_BASE_URL}${path}`;

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const portfolioApi = {
  async getPortfolio(): Promise<Portfolio> {
    const response = await fetch(buildUrl('/api/portfolios/me'));
    return parseJsonResponse<Portfolio>(response);
  },

  async addHolding(payload: AddHoldingRequest): Promise<void> {
    const response = await fetch(buildUrl('/api/portfolios/me/holdings'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with status ${response.status}`);
    }
  },
};
