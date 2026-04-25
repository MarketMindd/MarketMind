import { Body, Controller, Post } from '@nestjs/common';

import { AuthResponse, signInPayloadSchema, signUpPayloadSchema } from '@market-mind/common';
import type { SignInPayload, SignUpPayload } from '@market-mind/common';

import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { AuthService } from './auth.service';

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
}
