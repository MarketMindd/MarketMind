import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AddHoldingDto } from './dto/add-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import { PortfolioResponse } from './portfolios.types';
import { PortfoliosService } from './portfolios.service';

@Controller('portfolios/me')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Get()
  getMyPortfolio(): Promise<PortfolioResponse> {
    return this.portfoliosService.getMyPortfolio();
  }

  @Post('holdings')
  addHolding(@Body() dto: AddHoldingDto): Promise<PortfolioResponse> {
    return this.portfoliosService.addHolding(dto);
  }

  @Patch('holdings/:holdingId')
  updateHolding(
    @Param('holdingId', new ParseUUIDPipe()) holdingId: string,
    @Body() dto: UpdateHoldingDto,
  ): Promise<PortfolioResponse> {
    return this.portfoliosService.updateHolding(holdingId, dto);
  }

  @Delete('holdings/:holdingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHolding(
    @Param('holdingId', new ParseUUIDPipe()) holdingId: string,
  ): Promise<void> {
    await this.portfoliosService.deleteHolding(holdingId);
  }
}
