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
  private readonly summaryCache = new Map<string, { result: MarketSummaryResult; cachedAt: number }>();

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
  }

  async getAiMarketSummary(userId: string): Promise<MarketSummaryResult> {
    const cached = this.summaryCache.get(userId);

    if (cached && Date.now() - cached.cachedAt < AI_SUMMARY_CACHE_TTL_MS) {
      return cached.result;
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
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

      this.summaryCache.set(userId, { result, cachedAt: Date.now() });
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
