import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';

import { PortfolioService } from './portfolio.service';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { savePortfolioPayloadSchema } from '@market-mind/common';
import type { SavePortfolioPayload } from '@market-mind/common';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async getPortfolio(@Request() req: any) {
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
}
