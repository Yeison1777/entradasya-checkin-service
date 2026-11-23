import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { CheckinExceptionFilter } from './presentation/http/checkin-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new CheckinExceptionFilter());
  app.enableCors({ origin: config.get<string>('WEB_ORIGIN') });
  app.enableShutdownHooks();
  await app.listen(config.get<number>('PORT', 3007));
}
void bootstrap();
