import { Injectable, Logger } from '@nestjs/common';
import { appConfig } from '../config/appConfig';
import { NewsArticle } from '../filter/filter.types';
import { NetworkService } from '../network/network.service';
import { NewsProviderService } from './news.interface';

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Record<string, unknown>[];
}

@Injectable()
export class NewsApiService implements NewsProviderService {
  private readonly logger = new Logger(NewsApiService.name);

  constructor(private readonly networkService: NetworkService) {}

  async getNews(symbol: string): Promise<NewsArticle[]> {
    const params = new URLSearchParams({
      q: symbol,
      pageSize: '5',
      sortBy: 'publishedAt',
      language: 'en',
      apiKey: appConfig.newsApiKey,
    });
    const url = `https://newsapi.org/v2/everything?${params.toString()}`;

    try {
      return await this.networkService.get<NewsApiResponse, NewsArticle[]>(url, (res) =>
        this.mapData(res.articles ?? []),
      );
    } catch (error) {
      this.logger.warn(
        `NewsAPI fetch failed completely for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private mapData(articles: Record<string, unknown>[]): NewsArticle[] {
    return articles.map((a: Record<string, unknown>) => ({
      title: (a.title as string) ?? '',
      description: (a.description as string) ?? null,
      publishedAt: new Date(a.publishedAt as string),
      source: (a.source as Record<string, string>)?.name ?? 'NewsApi',
    }));
  }
}
