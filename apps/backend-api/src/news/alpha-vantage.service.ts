import { Injectable, Logger } from '@nestjs/common';
import { appConfig } from '../config/appConfig';
import { AlphaVantageFeedItem, AlphaVantageResponse, NewsArticle } from '../filter/filter.types';
import { NetworkService } from '../network/network.service';

@Injectable()
export class AlphaVantageService {
  private readonly logger = new Logger(AlphaVantageService.name);

  constructor(private readonly networkService: NetworkService) {}

  async getNews(symbol: string): Promise<NewsArticle[]> {
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&limit=5&sort=LATEST&apikey=${appConfig.alphaVantageApiKey}`;

    try {
      return await this.networkService.get<AlphaVantageResponse, NewsArticle[]>(url, (res) =>
        this.mapData(res.feed ?? []),
      );
    } catch (error) {
      this.logger.warn(
        `Alpha Vantage fetch failed completely for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  private mapData(feed: AlphaVantageFeedItem[]): NewsArticle[] {
    return feed.map((a) => ({
      title: a.title,
      description: a.summary ?? null,
      publishedAt: this.parseAlphaVantageDate(a.time_published),
      source: a.source_domain ?? 'AlphaVantage',
    }));
  }

  private parseAlphaVantageDate(timeStr: string): Date {
    if (!timeStr) return new Date();
    // typical format: "20231010T121500" -> "2023-10-10T12:15:00Z"
    const year = timeStr.slice(0, 4);
    const month = timeStr.slice(4, 6);
    const day = timeStr.slice(6, 8);
    const hour = timeStr.slice(9, 11);
    const min = timeStr.slice(11, 13);
    const sec = timeStr.slice(13, 15);
    return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
  }
}
