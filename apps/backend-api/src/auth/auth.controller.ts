import { Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { AuthService } from './auth.service';

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: any) {
    const parsed = SignUpSchema.parse(body);
    const user = await this.authService.signup(parsed.email, parsed.password, parsed.fullName);
    const { password, ...rest } = user;
    return rest;
  }

  @Post('signin')
  async signin(@Body() body: any) {
    const parsed = SignInSchema.parse(body);
    return this.authService.signin(parsed.email, parsed.password);
  }
}
