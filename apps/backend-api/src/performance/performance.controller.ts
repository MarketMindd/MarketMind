/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PerformanceService } from './performance.service';

@Controller('performance')
@UseGuards(AuthGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  async getPerformance(@Request() req: any) {
    return this.performanceService.getPerformance(req.user.id);
  }
}
