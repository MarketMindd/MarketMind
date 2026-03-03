import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

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
