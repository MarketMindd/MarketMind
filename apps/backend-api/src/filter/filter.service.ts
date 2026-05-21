import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import NewsAPI from 'newsapi';
import { Repository } from 'typeorm';
import { retry, RiskTolerance } from '@market-mind/common';
import {
  PortfolioEntity,
  RecommendationEntity,
  SymbolFilterStateEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { appConfig } from '../config/appConfig';
import { MarketSnapshot } from '../market/market.types';
import {
  AlphaVantageFeedItem,
  AlphaVantageResponse,
  FilteredSnapshot,
  NewsArticle,
  UserContext,
} from './filter.types';

// Gate 1 — noise floor: ignore moves smaller than this vs the last AI-triggered priceChange.
// Prevents redundant processing when price barely changes.
const DEDUP_THRESHOLD = 0.5;

// Gate 2 — significance: forward on price alone only when the cumulative drift is this large.
// Below this, we still forward if there are recent news articles.
const SIGNIFICANCE_THRESHOLD = 1;

// Articles published within this window are considered "recent" (one cron interval + buffer).
const RECENT_NEWS_WINDOW_MS = 20 * 60 * 1000;

// regularMarketChangePercent resets at market close each day, so a lastForwardedPriceChange
// from a previous trading day is a different baseline. Treat it as stale after 1 day.
const STALE_FORWARD_THRESHOLD_MS = 24 * 60 * 60 * 1000;

const NEWS_RETRY_DELAYS_MS = [1000, 2000] as const;

@Injectable()
export class FilterService {
  private readonly logger = new Logger(FilterService.name);
  private readonly newsApi = new NewsAPI(appConfig.newsApiKey);

  constructor(
    @InjectRepository(SymbolFilterStateEntity)
    private readonly filterStateRepo: Repository<SymbolFilterStateEntity>,
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepo: Repository<PortfolioEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepo: Repository<UserProfileEntity>,
    @InjectRepository(RecommendationEntity)
    private readonly recommendationRepo: Repository<RecommendationEntity>,
  ) {}

  async filter(snapshot: MarketSnapshot): Promise<FilteredSnapshot | null> {
    const stateRow = await this.filterStateRepo.findOne({
      where: { stockSymbol: snapshot.symbol },
    });

    // Treat as cold start if: no prior forward, or last forward was from a previous trading day.
    const isStale =
      stateRow !== null &&
      snapshot.fetchedAt.getTime() - stateRow.updatedAt.getTime() > STALE_FORWARD_THRESHOLD_MS;

    const lastForwardedPriceChange =
      stateRow !== null && !isStale ? Number(stateRow.lastForwardedPriceChange) : null;

    const delta = Math.abs(snapshot.priceChange - (lastForwardedPriceChange ?? 0));

    // Gate 1 — dedup: skip if cumulative drift from last AI trigger is still below threshold.
    // null means cold start (new or dormant symbol) — always passes.
    if (lastForwardedPriceChange !== null && delta < DEDUP_THRESHOLD) {
      this.logger.debug(
        `Dedup skip ${snapshot.symbol}: delta ${delta.toFixed(2)}% < ${DEDUP_THRESHOLD}%`,
      );
      return null;
    }

    // Check users before hitting the news API — no point fetching news if nobody is tracking.
    const users = await this.loadUserContexts(snapshot.symbol);
    if (users.length === 0) {
      this.logger.debug(`No users tracking ${snapshot.symbol}`);
      return null;
    }

    // Lazy news fetch — only runs for symbols that passed dedup AND have users.
    const news = await this.fetchNews(snapshot.symbol);

    const recentCutoff = new Date(snapshot.fetchedAt.getTime() - RECENT_NEWS_WINDOW_MS);
    const hasRecentNews = news.some((a) => a.publishedAt >= recentCutoff);
    const isColdStart = await this.hasMissingRecommendationCoverage(snapshot.symbol, users);

    // Gate 2 — significance: forward if cumulative drift is large enough, recent news exists,
    // or tracked risk tolerances do not yet have recommendation coverage.
    const isPriceSignificant = delta >= SIGNIFICANCE_THRESHOLD;
    if (!isPriceSignificant && !hasRecentNews && !isColdStart) {
      this.logger.debug(
        `Significance skip ${snapshot.symbol}: delta ${delta.toFixed(2)}%, no recent articles`,
      );
      return null;
    }

    // Persist the new lastForwardedPriceChange so cumulative drift resets from this point.
    await this.filterStateRepo.upsert(
      { stockSymbol: snapshot.symbol, lastForwardedPriceChange: snapshot.priceChange },
      ['stockSymbol'],
    );

    this.logger.log(
      `${snapshot.symbol} passed filter: delta=${delta.toFixed(2)}%, ` +
        `recentNews=${hasRecentNews}, coldStart=${isColdStart}, users=${users.length}`,
    );

    return { snapshot, news, users };
  }

  private async fetchNews(symbol: string): Promise<NewsArticle[]> {
    try {
      const [newsApiResult, alphaVantageResult] = await Promise.allSettled([
        retry(
          () =>
            this.newsApi.v2.everything({
              q: symbol,
              pageSize: 5,
              sortBy: 'publishedAt',
              language: 'en',
            }),
          {
            delaysMs: NEWS_RETRY_DELAYS_MS,
            onRetry: (attempt, delayMs) => {
              this.logger.warn(
                `NewsAPI fetch for ${symbol} failed (attempt ${attempt}); retrying in ${delayMs}ms`,
              );
            },
          },
        ),
        retry(
          async (): Promise<AlphaVantageResponse> => {
            const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&limit=5&sort=LATEST&apikey=${appConfig.alphaVantageApiKey}`;
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`Alpha Vantage API error: ${res.statusText}`);
            }
            return res.json() as Promise<AlphaVantageResponse>;
          },
          {
            delaysMs: NEWS_RETRY_DELAYS_MS,
            onRetry: (attempt, delayMs) => {
              this.logger.warn(
                `Alpha Vantage fetch for ${symbol} failed (attempt ${attempt}); retrying in ${delayMs}ms`,
              );
            },
          },
        ),
      ]);

      let articles: NewsArticle[] = [];

      if (newsApiResult.status === 'fulfilled') {
        const response = newsApiResult.value;
        articles = articles.concat(this.mapNewsApiArticles(response.articles ?? []));
      } else {
        this.logger.warn(`NewsAPI fetch failed completely for ${symbol}: ${newsApiResult.reason}`);
      }

      if (alphaVantageResult.status === 'fulfilled') {
        const response = alphaVantageResult.value;
        articles = articles.concat(this.mapAlphaVantageArticles(response.feed ?? []));
      } else {
        this.logger.warn(
          `Alpha Vantage fetch failed completely for ${symbol}: ${alphaVantageResult.reason}`,
        );
      }

      return articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    } catch (error) {
      this.logger.warn(
        `Failed to combine news fetch for ${symbol}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  // Use inferred ReturnType array from newsapi EverythingResponse articles
  private mapNewsApiArticles(
    articles: NonNullable<
      Awaited<ReturnType<InstanceType<typeof NewsAPI>['v2']['everything']>>['articles']
    >,
  ): NewsArticle[] {
    return articles.map((a) => ({
      title: a.title,
      description: a.description ?? null,
      publishedAt: new Date(a.publishedAt),
      source: a.source?.name ?? 'Unknown' + 'newsApi',
    }));
  }

  private mapAlphaVantageArticles(feed: AlphaVantageFeedItem[]): NewsArticle[] {
    return feed.map((a) => ({
      title: a.title,
      description: a.summary ?? null,
      publishedAt: this.parseAlphaVantageDate(a.time_published),
      source: a.source_domain ?? 'AlphaVantage' + 'alphaVantage',
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

  private async loadUserContexts(symbol: string): Promise<UserContext[]> {
    const portfolioRows = await this.portfolioRepo.find({
      where: { stockSymbol: symbol },
      select: ['userId'],
    });

    if (portfolioRows.length === 0) return [];

    const userIds = [...new Set(portfolioRows.map((p) => p.userId))];

    const profiles = await this.userProfileRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.riskTolerance'])
      .where('u.id IN (:...userIds)', { userIds })
      .getMany();

    return profiles.map((p) => ({
      userId: p.id,
      riskTolerance: p.riskTolerance as RiskTolerance,
    }));
  }

  private async hasMissingRecommendationCoverage(
    symbol: string,
    users: UserContext[],
  ): Promise<boolean> {
    const trackedRiskTolerances = [...new Set(users.map((user) => user.riskTolerance))];

    if (trackedRiskTolerances.length === 0) {
      return false;
    }

    const recommendationRows = await this.recommendationRepo.find({
      where: { stockSymbol: symbol },
      select: ['riskTolerance'],
    });

    const coveredRiskTolerances = new Set(
      recommendationRows.map((recommendation) => recommendation.riskTolerance as RiskTolerance),
    );

    return trackedRiskTolerances.some((riskTolerance) => !coveredRiskTolerances.has(riskTolerance));
  }
}
