import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { appConfig } from './config/appConfig';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.enableCors({
    origin: appConfig.clientUrl,
    credentials: true,
  });
  app.setGlobalPrefix(globalPrefix);
  const port = appConfig.port;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
};

bootstrap();
