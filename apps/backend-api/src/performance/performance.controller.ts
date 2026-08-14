/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Get } from '@nestjs/common';
import { Public } from '../decorators/roles.decorator';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Public()
  @Get()
  async getPerformance() {
    return this.performanceService.getPerformance();
  }
}
