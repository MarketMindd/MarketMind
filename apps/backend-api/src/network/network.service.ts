import { Injectable, Logger } from '@nestjs/common';
import { retry } from '@market-mind/common';

const NETWORK_RETRY_DELAYS_MS = [1000, 2000] as const;

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  async get<TRaw, TData>(url: string, mapper: (data: TRaw) => TData): Promise<TData> {
    try {
      const response = await retry(
        async (): Promise<TRaw> => {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`API error: ${res.statusText}`);
          }
          return res.json() as Promise<TRaw>;
        },
        {
          delaysMs: NETWORK_RETRY_DELAYS_MS,
          onRetry: (attempt, delayMs) => {
            this.logger.warn(
              `Fetch failed (attempt ${attempt}); retrying in ${delayMs}ms for ${url}`,
            );
          },
        },
      );
      return mapper(response);
    } catch (error) {
      this.logger.warn(
        `Fetch failed completely for ${url}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
