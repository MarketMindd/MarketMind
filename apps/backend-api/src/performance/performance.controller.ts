import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../decorators/roles.decorator';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Public()
  @Get()
  async getPerformance(@Query('riskTolerance') riskTolerance?: string) {
    return this.performanceService.getPerformance(riskTolerance);
  }
}
