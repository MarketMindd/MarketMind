import { Body, Controller, Post } from '@nestjs/common';

import { AuthResponse, signInPayloadSchema, signUpPayloadSchema } from '@market-mind/common';
import type { SignInPayload, SignUpPayload } from '@market-mind/common';

import { Public } from '../decorators/roles.decorator';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { AuthService } from './auth.service';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(signUpPayloadSchema)) body: SignUpPayload,
  ): Promise<AuthResponse> {
    return await this.authService.signup(body.email, body.password, body.fullName);
  }

  @Post('signin')
  async signin(
    @Body(new ZodValidationPipe(signInPayloadSchema)) body: SignInPayload,
  ): Promise<AuthResponse> {
    return this.authService.signin(body.email, body.password);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  async logout(@Body() body: { userId: string; refreshToken: string }) {
    await this.authService.logout(body.userId, body.refreshToken);
    return { success: true };
  }
}
