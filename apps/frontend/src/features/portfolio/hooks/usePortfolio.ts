import { useCallback, useEffect, useState } from 'react';
import { portfolioApi } from '../api/portfolioApi';
import { AddHoldingRequest, Portfolio } from '../types';

interface UsePortfolioResult {
  portfolio: Portfolio | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addHolding: (payload: AddHoldingRequest) => Promise<void>;
}

const defaultErrorMessage = 'Unable to load portfolio data. Please try again.';

export const usePortfolio = (): UsePortfolioResult => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await portfolioApi.getPortfolio();
      setPortfolio(result);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error && fetchError.message
          ? fetchError.message
          : defaultErrorMessage;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addHolding = useCallback(
    async (payload: AddHoldingRequest) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await portfolioApi.addHolding(payload);
        await refresh();
      } catch (submitError) {
        const message =
          submitError instanceof Error && submitError.message
            ? submitError.message
            : 'Unable to add holding. Please try again.';
        setError(message);
        throw submitError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh],
  );

  return { portfolio, isLoading, isSubmitting, error, refresh, addHolding };
};
