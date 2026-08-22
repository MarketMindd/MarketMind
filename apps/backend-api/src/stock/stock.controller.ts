import { Controller, Get, Query } from '@nestjs/common';
import { getSymbolsQuerySchema, RiskTolerance, Stock } from '@market-mind/common';
import { Public } from '../decorators/roles.decorator';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Public()
  @Get('basic')
  async getBasicStocks(): Promise<Stock[]> {
    return this.stockService.getBasicStocks();
  }

  @Get()
  async getStocks(
    @Query('symbols', new ZodValidationPipe(getSymbolsQuerySchema)) symbols: string[],
    @Query('riskTolerance') riskTolerance?: RiskTolerance,
  ): Promise<Stock[]> {
    if (!symbols || symbols.length === 0) {
      return this.stockService.getAllStocks(riskTolerance);
    }

    return this.stockService.getStocksBySymbols(symbols, riskTolerance);
  }
}
