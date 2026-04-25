import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { appConfig } from '../config/appConfig';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.secret,
    });
  }

  // payload will be the data we signed in AuthService
  async validate(payload: any) {
    // You can extend this to fetch the latest user from database if desired
    // For now, simply return payload (will be attached to request.user)
    return payload;
  }
}
