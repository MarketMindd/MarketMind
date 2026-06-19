export interface RetryOptions {
  delaysMs: readonly number[];
  onRetry?: (attemptNumber: number, delayMs: number, error: unknown) => void;
  shouldRetry?: (error: unknown) => boolean;
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.delaysMs.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === options.delaysMs.length) {
        break;
      }

      if (options.shouldRetry && !options.shouldRetry(error)) {
        break;
      }

      const delayMs = options.delaysMs[attempt];
      options.onRetry?.(attempt + 1, delayMs, error);
      await sleep(delayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry failed');
};
