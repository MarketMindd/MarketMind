import { Controller, Get, Query } from '@nestjs/common';
import { getSymbolsQuerySchema, Stock } from '@market-mind/common';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async getStocks(
    @Query('symbols', new ZodValidationPipe(getSymbolsQuerySchema)) symbols: string[],
  ): Promise<Stock[]> {
    if (!symbols || symbols.length === 0) {
      return this.stockService.getAllStocks();
    }
    return this.stockService.getStocksBySymbols(symbols);
  }
}
