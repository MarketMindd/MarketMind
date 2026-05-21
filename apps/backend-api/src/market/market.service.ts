import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';
import { retry } from '@market-mind/common';
import { MarketDataEntity, StockEntity } from '@market-mind/database';
import { PipelineService } from '../pipeline/pipeline.service';
import { MarketSnapshot } from './market.types';

const CRON_JOB_NAME = 'market-poll';
const MARKET_POLL_SCHEDULE = '*/1 * * * *';
const QUOTE_RETRY_DELAYS_MS = [1000, 2000] as const;

interface QuoteSnapshotFields {
  regularMarketPrice?: number | null;
  regularMarketChangePercent?: number | null;
  regularMarketVolume?: number | null;
}

@Injectable()
export class MarketService implements OnModuleInit {
  private readonly logger = new Logger(MarketService.name);
  private readonly yahooFinance = new YahooFinance();

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly pipelineService: PipelineService,
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepo: Repository<MarketDataEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
  ) {}

  onModuleInit(): void {
    const job = new CronJob(MARKET_POLL_SCHEDULE, () => {
      void this.run();
    });

    this.schedulerRegistry.addCronJob(CRON_JOB_NAME, job);
    job.start();

    this.logger.log('Market poll cron registered');
  }

  async run(): Promise<void> {
    const job = this.schedulerRegistry.getCronJob(CRON_JOB_NAME);
    job.stop();

    this.logger.log('Market poll started');

    try {
      await this.processAllSymbols();
    } finally {
      job.start();
      this.logger.log('Market poll completed');
    }
  }

  private async processAllSymbols(): Promise<void> {
    const symbols = await this.getTrackedSymbols();

    if (symbols.length === 0) {
      this.logger.log('No tracked symbols found for market poll');
      return;
    }

    this.logger.log(`Processing ${symbols.length} tracked symbols`);

    const fetchedAt = new Date();
    const quotesBySymbol = await this.fetchQuotesWithRetry(symbols);

    for (const symbol of symbols) {
      try {
        const quote = quotesBySymbol[symbol];
        if (!quote) {
          this.logger.warn(`No quote returned for ${symbol}; skipping`);
          continue;
        }

        const snapshot = this.createSnapshot(symbol, quote, fetchedAt);
        await this.persistSnapshot(snapshot);
        await this.pipelineService.process(snapshot);
      } catch (error) {
        this.logger.error(
          `Failed to process symbol ${symbol}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  private async getTrackedSymbols(): Promise<string[]> {
    const symbols = await this.stockRepo
      .createQueryBuilder('stocks')
      .select('stocks.symbol', 'symbol')
      .getRawMany<{ symbol: string }>();

    return symbols
      .map(({ symbol }) => symbol?.trim())
      .filter((symbol): symbol is string => Boolean(symbol));
  }

  private async fetchQuotesWithRetry(
    symbols: string[],
  ): Promise<Record<string, QuoteSnapshotFields>> {
    const quotesBySymbol = await retry(
      () => this.yahooFinance.quote(symbols, { return: 'object' }),
      {
        delaysMs: QUOTE_RETRY_DELAYS_MS,
        onRetry: (attemptNumber: number, delayMs: number) => {
          this.logger.warn(
            `Batched quote fetch for ${symbols.length} symbols failed on attempt ${attemptNumber}; retrying in ${delayMs}ms`,
          );
        },
      },
    );

    return quotesBySymbol as Record<string, QuoteSnapshotFields>;
  }

  private createSnapshot(
    symbol: string,
    quote: QuoteSnapshotFields,
    fetchedAt: Date,
  ): MarketSnapshot {
    return {
      symbol,
      price: Number(quote.regularMarketPrice ?? 0),
      priceChange: Number(quote.regularMarketChangePercent ?? 0),
      volume: Number(quote.regularMarketVolume ?? 0),
      fetchedAt,
    };
  }

  private async persistSnapshot(snapshot: MarketSnapshot): Promise<void> {
    await this.marketDataRepo.save({
      time: snapshot.fetchedAt,
      stockSymbol: snapshot.symbol,
      price: snapshot.price,
      volume: snapshot.volume,
      priceChange: snapshot.priceChange,
    });
  }
}
