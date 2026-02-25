import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PortfolioEntity,
  PortfolioHoldingEntity,
} from '@market-mind/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUserService } from './current-user.service';
import { AddHoldingDto } from './dto/add-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import { CURRENT_PRICE_BY_SYMBOL } from './portfolios.constants';
import { PortfolioHoldingResponse, PortfolioResponse } from './portfolios.types';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    @InjectRepository(PortfolioHoldingEntity)
    private readonly holdingRepository: Repository<PortfolioHoldingEntity>,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async getMyPortfolio(): Promise<PortfolioResponse> {
    const portfolio = await this.getOrCreatePortfolio();
    return this.buildResponse(portfolio);
  }

  async addHolding(dto: AddHoldingDto): Promise<PortfolioResponse> {
    const portfolio = await this.getOrCreatePortfolio();
    const existingHolding = portfolio.holdings.find(
      (holding) => holding.symbol === dto.symbol,
    );

    if (!existingHolding) {
      await this.holdingRepository.save(
        this.holdingRepository.create({
          portfolioId: portfolio.id,
          symbol: dto.symbol,
          companyName: dto.companyName,
          shares: dto.shares.toFixed(6),
          avgCost: dto.avgPrice.toFixed(6),
        }),
      );
    } else {
      const oldShares = this.toNumber(existingHolding.shares);
      const oldAvgCost = this.toNumber(existingHolding.avgCost);
      const newTotalShares = oldShares + dto.shares;
      const weightedAvgCost =
        (oldShares * oldAvgCost + dto.shares * dto.avgPrice) / newTotalShares;

      existingHolding.companyName = dto.companyName;
      existingHolding.shares = newTotalShares.toFixed(6);
      existingHolding.avgCost = weightedAvgCost.toFixed(6);

      await this.holdingRepository.save(existingHolding);
    }

    return this.getMyPortfolio();
  }

  async updateHolding(
    holdingId: string,
    dto: UpdateHoldingDto,
  ): Promise<PortfolioResponse> {
    const portfolio = await this.getOrCreatePortfolio();
    const holding = portfolio.holdings.find((item) => item.id === holdingId);

    if (!holding) {
      throw new NotFoundException('Holding not found');
    }

    if (dto.companyName !== undefined) {
      holding.companyName = dto.companyName;
    }
    if (dto.shares !== undefined) {
      holding.shares = dto.shares.toFixed(6);
    }
    if (dto.avgPrice !== undefined) {
      holding.avgCost = dto.avgPrice.toFixed(6);
    }

    await this.holdingRepository.save(holding);
    return this.getMyPortfolio();
  }

  async deleteHolding(holdingId: string): Promise<void> {
    const portfolio = await this.getOrCreatePortfolio();
    const deleteResult = await this.holdingRepository.delete({
      id: holdingId,
      portfolioId: portfolio.id,
    });

    if (!deleteResult.affected) {
      throw new NotFoundException('Holding not found');
    }
  }

  private async getOrCreatePortfolio(): Promise<PortfolioEntity> {
    const userId = this.currentUserService.getUserId();
    let portfolio = await this.portfolioRepository.findOne({
      where: { userId },
      relations: { holdings: true },
      order: { holdings: { updatedAt: 'DESC' } },
    });

    if (!portfolio) {
      portfolio = await this.portfolioRepository.save(
        this.portfolioRepository.create({ userId }),
      );
      portfolio.holdings = [];
    }

    return portfolio;
  }

  private buildResponse(portfolio: PortfolioEntity): PortfolioResponse {
    return {
      id: portfolio.id,
      userId: portfolio.userId,
      holdings: portfolio.holdings.map((holding): PortfolioHoldingResponse => {
        const shares = this.toNumber(holding.shares);
        const avgCost = this.toNumber(holding.avgCost);
        const current = CURRENT_PRICE_BY_SYMBOL[holding.symbol] ?? avgCost;
        const gainLoss = (current - avgCost) * shares;

        return {
          id: holding.id,
          symbol: holding.symbol,
          companyName: holding.companyName,
          shares,
          avgCost,
          current,
          gainLoss,
          updatedAt: holding.updatedAt.toISOString(),
        };
      }),
    };
  }

  private toNumber(value: number | string): number {
    if (typeof value === 'number') {
      return value;
    }

    return Number(value);
  }
}
