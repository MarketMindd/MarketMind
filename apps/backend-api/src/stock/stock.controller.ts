import { Controller, Get, Param } from '@nestjs/common';
import { getStockBySymbolParamSchema, Stock } from '@market-mind/common';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async getStocks(): Promise<Stock[]> {
    return this.stockService.getStocks();
  }

  @Get(':symbol')
  async getStock(
    @Param('symbol', new ZodValidationPipe(getStockBySymbolParamSchema)) symbol: Stock['symbol'],
  ): Promise<Stock> {
    return this.stockService.getStockBySymbol(symbol);
  }
}
