import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { PortfolioItem, SavePortfolioPayload } from '@market-mind/common';
import { PortfolioEntity, StockEntity } from '@market-mind/database';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepo: Repository<PortfolioEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepo: Repository<StockEntity>,
  ) {}

  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    const items = await this.portfolioRepo.find({ where: { userId } });
    return items.map((item) => ({
      id: item.id,
      ticker: item.stockSymbol,
      shares: Number(item.shares),
      avgPrice: Number(item.avgPrice),
    }));
  }

  async savePortfolio(userId: string, payload: SavePortfolioPayload): Promise<void> {
    const currentItems = await this.portfolioRepo.find({ where: { userId } });

    const incomingItems = payload.items;

    const incomingSymbols = incomingItems.map((i) => i.ticker);
    const itemsToDelete = currentItems.filter((i) => !incomingSymbols.includes(i.stockSymbol));

    if (itemsToDelete.length > 0) {
      await this.portfolioRepo.remove(itemsToDelete);
    }

    // TODO: Change this when list of stocks will be stored in db
    // Ensure all incoming stocks exist in the database
    if (incomingSymbols.length > 0) {
      const existingStocks = await this.stockRepo.find({
        where: { symbol: In(incomingSymbols) },
      });
      const existingStockSymbols = existingStocks.map((s) => s.symbol);
      const missingSymbols = incomingSymbols.filter((s) => !existingStockSymbols.includes(s));

      if (missingSymbols.length > 0) {
        const newStocks = missingSymbols.map((symbol) =>
          this.stockRepo.create({
            symbol,
            name: symbol, // Fallback name
            sector: 'Unknown', // Fallback sector
          }),
        );
        await this.stockRepo.save(newStocks);
      }
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
}
