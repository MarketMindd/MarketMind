import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import * as fs from 'fs';
import { AppModule } from './app/app.module';
import { appConfig } from './config/appConfig';

const bootstrap = async () => {
  let httpsOptions = undefined;
  if (process.env.NODE_ENV === 'production') {
    try {
      httpsOptions = {
        key: fs.readFileSync(appConfig.https.keyPath),
        cert: fs.readFileSync(appConfig.https.certPath),
      };
      Logger.log(`🔒 HTTPS enabled using provided certificates`);
    } catch (e) {
      Logger.error(`Failed to load HTTPS certificates: ${e.message}`);
    }
  }

  const app = await NestFactory.create(AppModule, { httpsOptions });
  const globalPrefix = 'api';
  app.enableCors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }

      const allowedOrigins = [appConfig.clientUrl];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });
  app.setGlobalPrefix(globalPrefix);
  const port = appConfig.port;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
};

bootstrap();
