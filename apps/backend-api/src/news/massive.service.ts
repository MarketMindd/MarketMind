import { Injectable, Logger } from '@nestjs/common';
import { appConfig } from '../config/appConfig';
import { MassiveFeedItem, MassiveResponse, NewsArticle } from '../filter/filter.types';
import { NetworkService } from '../network/network.service';
import { NewsProviderService } from './news.interface';

@Injectable()
export class MassiveApiService implements NewsProviderService {
  readonly name = 'Massive API';
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
        this.mapData(res.results ?? [], symbol),
      );
    } catch (error) {
      this.logger.warn(
        `${this.name} fetch failed completely for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private mapData(results: MassiveFeedItem[], symbol: string): NewsArticle[] {
    return results.map((a) => {
      let description = a.description ?? '';

      const relevantInsights = a.insights?.filter((i) => i.ticker === symbol) ?? [];

      if (relevantInsights.length > 0) {
        const insightsText = relevantInsights
          .map((i) => `Sentiment: ${i.sentiment.toUpperCase()}\nReasoning: ${i.sentiment_reasoning}`)
          .join('\n\n');
        description = [description, `--- Extracted Insights for ${symbol} ---\n${insightsText}`].filter(Boolean).join('\n\n');
      }

      return {
        title: a.title,
        description: description || null,
        publishedAt: new Date(a.published_utc),
        source: a.publisher?.name ?? this.name,
      };
    });
  }
}
