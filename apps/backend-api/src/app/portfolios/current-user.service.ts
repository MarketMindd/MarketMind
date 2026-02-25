import { Injectable } from '@nestjs/common';
import { HARDCODED_USER_ID } from './portfolios.constants';

@Injectable()
export class CurrentUserService {
  getUserId(): string {
    return HARDCODED_USER_ID;
  }
}
