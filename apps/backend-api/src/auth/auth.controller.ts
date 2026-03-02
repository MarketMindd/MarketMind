import { Body, Controller, Post } from '@nestjs/common';
import { signInPayloadSchema, signUpPayloadSchema } from '@market-mind/common';
import type { SignInPayload, SignUpPayload } from '@market-mind/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body(new ZodValidationPipe(signUpPayloadSchema)) body: SignUpPayload,
  ) {
    const user = await this.authService.signup(
      body.email,
      body.password,
      body.fullName,
    );
    const { password, ...rest } = user;
    return rest;
  }

  @Post('signin')
  async signin(
    @Body(new ZodValidationPipe(signInPayloadSchema)) body: SignInPayload,
  ) {
    return this.authService.signin(body.email, body.password);
  }
}
