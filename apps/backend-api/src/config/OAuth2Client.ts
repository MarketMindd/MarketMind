import { OAuth2Client } from 'google-auth-library';
import { appConfig } from './appConfig';

export const oAuth2Client = new OAuth2Client(
  appConfig.auth.googleClientId,
  appConfig.auth.googleClientSecret,
  'postmessage',
);
