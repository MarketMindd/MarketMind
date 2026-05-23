import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app/app.module';
import { appConfig } from './config/appConfig';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
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
