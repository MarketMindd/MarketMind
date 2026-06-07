/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Get, Put, Request } from '@nestjs/common';
import { savePortfolioPayloadSchema } from '@market-mind/common';
import type {
  MarketSummaryResult,
  PortfolioItemWithStock,
  SavePortfolioPayload,
} from '@market-mind/common';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async getPortfolio(@Request() req: any): Promise<PortfolioItemWithStock[]> {
    const userId = req.user.id;
    const portfolio = await this.portfolioService.getPortfolio(userId);
    return portfolio;
  }

  @Put()
  async savePortfolio(
    @Request() req: any,
    @Body(new ZodValidationPipe(savePortfolioPayloadSchema)) body: SavePortfolioPayload,
  ) {
    const userId = req.user.id;
    await this.portfolioService.savePortfolio(userId, body);
    return { success: true };
  }

  @Get('market-summary')
  async getAiMarketSummary(@Request() req: any): Promise<MarketSummaryResult> {
    const userId = req.user.id;
    return this.portfolioService.getAiMarketSummary(userId);
  }
}
