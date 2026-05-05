import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './shared/config/app.config';
import { GlobalHttpExceptionFilter } from './shared/http/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const appCfg = configService.getOrThrow<AppConfig>('app');

  app.use(helmet());
  app.enableCors({
    origin: appCfg.corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  });
  app.setGlobalPrefix(appCfg.apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Analítica Territorial - CNE')
    .setDescription('Backend hexagonal para tableros electorales, socioeconómicos y poblacionales')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${appCfg.apiPrefix}/docs`, app, document);

  await app.listen(appCfg.port);
  logger.log(`Servidor en http://localhost:${appCfg.port}/${appCfg.apiPrefix}`);
  logger.log(`Swagger en http://localhost:${appCfg.port}/${appCfg.apiPrefix}/docs`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fallo al arrancar la aplicación:', err);
  process.exit(1);
});
