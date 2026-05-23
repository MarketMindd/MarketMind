import { Injectable, Logger } from '@nestjs/common';
import { appConfig } from '../config/appConfig';
import { MassiveFeedItem, MassiveResponse, NewsArticle } from '../filter/filter.types';
import { NetworkService } from '../network/network.service';
import { NewsProviderService } from './news.interface';

@Injectable()
export class MassiveApiService implements NewsProviderService {
  private readonly logger = new Logger(MassiveApiService.name);

  constructor(private readonly networkService: NetworkService) {}

  async getNews(symbol: string): Promise<NewsArticle[]> {
    const params = new URLSearchParams({
      ticker: symbol,
      limit: '5',
      apiKey: appConfig.massiveApiKey,
    });
    const url = `https://api.massive.com/v2/reference/news?${params.toString()}`;

    try {
      return await this.networkService.get<MassiveResponse, NewsArticle[]>(url, (res) =>
        this.mapData(res.results ?? []),
      );
    } catch (error) {
      this.logger.warn(
        `Massive API fetch failed completely for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private mapData(results: MassiveFeedItem[]): NewsArticle[] {
    return results.map((a) => ({
      title: a.title,
      description: a.description ?? null,
      publishedAt: new Date(a.published_utc),
      source: a.publisher?.name ?? 'Massive API',
    }));
  }
}
