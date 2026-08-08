import { Injectable, Logger } from '@nestjs/common';
import { appConfig } from '../config/appConfig';
import { NewsArticle } from '../filter/filter.types';
import { NetworkService } from '../network/network.service';
import { NEWS_CACHE_TTL_MS } from './news.constants';
import { NewsProviderService } from './news.interface';

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Record<string, unknown>[];
}

@Injectable()
export class NewsApiService implements NewsProviderService {
  readonly name = 'NewsAPI';
  private readonly logger = new Logger(NewsApiService.name);

  constructor(private readonly networkService: NetworkService) {}

  async getNews(symbol: string): Promise<NewsArticle[]> {
    const buildUrl = (apiKey: string) => {
      const params = new URLSearchParams({
        q: symbol,
        pageSize: '5',
        sortBy: 'publishedAt',
        language: 'en',
        apiKey,
      });
      return `https://newsapi.org/v2/everything?${params.toString()}`;
    };

    try {
      return await this.networkService.getWithKeyRotation<NewsApiResponse, NewsArticle[]>(
        appConfig.newsApiKeys,
        buildUrl,
        (res) => this.mapData(res.articles ?? []),
        { cacheTtlMs: NEWS_CACHE_TTL_MS },
      );
    } catch (error) {
      this.logger.warn(
        `${this.name} fetch failed completely for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private mapData(articles: Record<string, unknown>[]): NewsArticle[] {
    return articles.map((a: Record<string, unknown>) => ({
      title: (a.title as string) ?? '',
      description: (a.description as string) ?? null,
      publishedAt: new Date(a.publishedAt as string),
      source: (a.source as Record<string, string>)?.name ?? this.name,
    }));
  }
}
