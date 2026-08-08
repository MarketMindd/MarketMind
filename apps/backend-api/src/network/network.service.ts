import { Injectable, Logger } from '@nestjs/common';
import { retry } from '@market-mind/common';

const NETWORK_RETRY_DELAYS_MS = [1000, 2000] as const;
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60_000;

export class RateLimitError extends Error {
  constructor(host: string, cooldownMs: number) {
    super(`Rate limited by ${host}; cooling down for ${Math.ceil(cooldownMs / 1000)}s`);
    this.name = 'RateLimitError';
  }
}

interface GetOptions {
  cacheTtlMs?: number;
}

interface CacheEntry {
  raw: unknown;
  expiresAt: number;
}

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly cooldownUntilByHost = new Map<string, number>();

  async get<TRaw, TData>(
    url: string,
    mapper: (data: TRaw) => TData,
    options?: GetOptions,
    cooldownId?: string,
  ): Promise<TData> {
    const ttl = options?.cacheTtlMs ?? 0;

    const cached = ttl > 0 ? this.cache.get(url) : undefined;
    if (cached && cached.expiresAt > Date.now()) {
      return mapper(cached.raw as TRaw);
    }

    const host = this.hostOf(url);
    const cooldownKey = cooldownId ?? host;
    const cooldownUntil = this.cooldownUntilByHost.get(cooldownKey) ?? 0;
    if (cooldownUntil > Date.now()) {
      throw new RateLimitError(host, cooldownUntil - Date.now());
    }

    const raw = await this.fetchWithRetry<TRaw>(url, host, cooldownKey);

    if (ttl > 0) {
      this.cache.set(url, { raw, expiresAt: Date.now() + ttl });
    }
    return mapper(raw);
  }

  async getWithKeyRotation<TRaw, TData>(
    keys: string[],
    buildUrl: (apiKey: string) => string,
    mapper: (data: TRaw) => TData,
    options?: GetOptions,
  ): Promise<TData> {
    if (keys.length === 0) {
      throw new Error('No API keys configured');
    }

    let lastError: unknown;
    for (const key of keys) {
      const url = buildUrl(key);
      try {
        return await this.get<TRaw, TData>(url, mapper, options, `${this.hostOf(url)}:${key}`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('All API keys exhausted');
  }

  private async fetchWithRetry<TRaw>(url: string, host: string, cooldownKey: string): Promise<TRaw> {
    try {
      return await retry(
        async (): Promise<TRaw> => {
          const res = await fetch(url);

          if (res.status === 429) {
            const cooldownMs = this.parseRetryAfterMs(res) ?? DEFAULT_RATE_LIMIT_COOLDOWN_MS;
            this.cooldownUntilByHost.set(cooldownKey, Date.now() + cooldownMs);
            throw new RateLimitError(host, cooldownMs);
          }
          if (!res.ok) {
            throw new Error(`API error: ${res.statusText}`);
          }
          return res.json() as Promise<TRaw>;
        },
        {
          delaysMs: NETWORK_RETRY_DELAYS_MS,
          shouldRetry: (error) => !(error instanceof RateLimitError),
          onRetry: (attempt, delayMs) => {
            this.logger.warn(
              `Fetch failed (attempt ${attempt}); retrying in ${delayMs}ms for ${url}`,
            );
          },
        },
      );
    } catch (error) {
      this.logger.warn(
        `Fetch failed completely for ${url}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private hostOf(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }

  private parseRetryAfterMs(res: Response): number | null {
    const header = res.headers?.get?.('retry-after');
    if (!header) return null;
    const seconds = Number(header);
    if (!Number.isNaN(seconds)) return seconds * 1000;
    const dateMs = Date.parse(header);
    if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now());
    return null;
  }
}
