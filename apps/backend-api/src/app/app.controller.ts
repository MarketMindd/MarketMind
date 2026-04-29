import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // example protected endpoint
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getData(@Request() req: any) {
    // request.user will be the validated JWT payload
    return {
      ...this.appService.getData(),
      you: req.user,
    };
  }
}
