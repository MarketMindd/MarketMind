import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  MarketSummaryResult,
  PortfolioItemWithStock,
  SavePortfolioPayload,
} from '@market-mind/common';
import {
  MarketDataEntity,
  PortfolioEntity,
  StockEntity,
  UserProfileEntity,
} from '@market-mind/database';
import { AiService } from '../ai/ai.service';

const AI_SUMMARY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepo: Repository<PortfolioEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userRepo: Repository<UserProfileEntity>,
    private readonly aiService: AiService,
  ) {}

  async getPortfolio(userId: string): Promise<PortfolioItemWithStock[]> {
    const rawData = await this.portfolioRepo
      .createQueryBuilder('portfolio')
      .where('portfolio.userId = :userId', { userId })
      .leftJoin(StockEntity, 'stocks', 'stocks.symbol = portfolio.stockSymbol')
      .leftJoin(MarketDataEntity, 'marketData', 'marketData.stockSymbol = portfolio.stockSymbol')
      .select([
        'portfolio.id as "portfolioId"',
        'portfolio.stockSymbol as "ticker"',
        'portfolio.shares as "shares"',
        'portfolio.avgPrice as "avgPrice"',
        'stocks.symbol as "symbol"',
        'stocks.name as "name"',
        'stocks.sector as "sector"',
        'marketData.price as "price"',
      ])
      .distinctOn(['portfolio.stockSymbol'])
      .orderBy('portfolio.stockSymbol')
      .addOrderBy('marketData.time', 'DESC')
      .getRawMany();

    if (rawData.length === 0) return [];

    return rawData.map((raw) => {
      const stock = raw.symbol
        ? {
            symbol: raw.symbol,
            name: raw.name,
            sector: raw.sector,
            marketData: {
              price: Number(raw.price ?? 0),
            },
          }
        : undefined;

      return {
        id: raw.portfolioId,
        ticker: raw.ticker,
        shares: Number(raw.shares),
        avgPrice: Number(raw.avgPrice),
        stock,
      };
    });
  }

  async savePortfolio(userId: string, payload: SavePortfolioPayload): Promise<void> {
    const currentItems = await this.portfolioRepo.find({ where: { userId } });

    const incomingItems = payload.items;

    const incomingSymbols = incomingItems.map((i) => i.ticker);
    const itemsToDelete = currentItems.filter((i) => !incomingSymbols.includes(i.stockSymbol));

    if (itemsToDelete.length > 0) {
      await this.portfolioRepo.remove(itemsToDelete);
    }

    const itemsToSave: PortfolioEntity[] = [];

    for (const item of incomingItems) {
      const existing = currentItems.find((i) => i.stockSymbol === item.ticker);
      if (existing) {
        existing.shares = item.shares;
        existing.avgPrice = item.avgPrice;
        itemsToSave.push(existing);
      } else {
        const newItem = this.portfolioRepo.create({
          userId,
          stockSymbol: item.ticker,
          shares: item.shares,
          avgPrice: item.avgPrice,
        });
        itemsToSave.push(newItem);
      }
    }

    if (itemsToSave.length > 0) {
      await this.portfolioRepo.save(itemsToSave);
    }

    await this.clearUserSummaryCache(userId);
  }

  async clearUserSummaryCache(userId: string): Promise<void> {
    await this.userRepo.update({ id: userId }, { aiSummaryCache: null, aiSummaryCachedAt: null });
  }

  private readCachedSummary(user: UserProfileEntity): MarketSummaryResult | null {
    if (!user.aiSummaryCache || !user.aiSummaryCachedAt) return null;

    const age = Date.now() - new Date(user.aiSummaryCachedAt).getTime();
    if (age >= AI_SUMMARY_CACHE_TTL_MS) return null;

    return user.aiSummaryCache as MarketSummaryResult;
  }

  async getAiMarketSummary(userId: string): Promise<MarketSummaryResult> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cached = this.readCachedSummary(user);
    if (cached) {
      return cached;
    }

    const portfolio = await this.getPortfolio(userId);
    const allStocks = await this.stockRepo.find({ select: ['symbol', 'name', 'sector'] });
    const availableSymbols = allStocks.map((s) => `${s.symbol} (${s.name} - ${s.sector})`);

    try {
      const aiResult = await this.aiService.generateMarketSummary(
        portfolio,
        user.riskTolerance,
        user.interests ?? [],
        availableSymbols,
      );

      const result: MarketSummaryResult = {
        ...aiResult,
        riskTolerance: user.riskTolerance,
        interests: user.interests ?? [],
      };

      await this.userRepo.update(
        { id: userId },
        { aiSummaryCache: result, aiSummaryCachedAt: new Date() },
      );
      return result;
    } catch (error) {
      this.logger.error(
        `AI market summary failed (not cached): ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        summary: 'Market summary unavailable at this time. Please try again shortly.',
        suggestedStocks: [],
        riskTolerance: user.riskTolerance,
        interests: user.interests ?? [],
      };
    }
  }
}
