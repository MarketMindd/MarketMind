import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PortfolioItemWithStock, SavePortfolioPayload } from '@market-mind/common';
import { MarketDataEntity, PortfolioEntity, StockEntity, UserProfileEntity } from '@market-mind/database';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepo: Repository<PortfolioEntity>,
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

  async getAiMarketSummary(userId: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const portfolio = await this.getPortfolio(userId);
    const summary = await this.aiService.generateMarketSummary(portfolio, user.riskTolerance);
    return summary;
  }
}
