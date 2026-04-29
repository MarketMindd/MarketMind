import { Controller, Get, Param, Query } from '@nestjs/common';

import { getStockBySymbolParamSchema, Stock } from '@market-mind/common';

import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async getStocks(@Query('symbols') symbolsString: string): Promise<Stock[]> {
    if (!symbolsString) {
      return this.stockService.getAllStocks();
    }
    const symbols = symbolsString.split(',').filter(Boolean);
    return this.stockService.getStocksBySymbols(symbols);
  }

}
