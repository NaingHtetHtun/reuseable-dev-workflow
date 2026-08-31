import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS
  app.enableCors();

  // Swagger/OpenAPI setup
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('DevFlow Platform API')
      .setDescription(
        'Developer workflow automation platform — build reusable components and workflow automation',
      )
      .setVersion('0.1.0')
      .addTag('projects', 'Project management')
      .addTag('workflows', 'Workflow management')
      .addTag('triggers', 'Trigger management')
      .addTag('webhooks', 'Webhook execution')
      .addTag('credentials', 'Credential management')
      .addTag('oauth', 'OAuth integration')
      .addTag('preview', 'Workflow preview and validation')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    logger.log(
      `Swagger UI available at: http://localhost:${configService.get<number>('app.port', 3000)}/api/docs`,
    );
  }

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API available at: http://localhost:${port}/api/v1`);
}

bootstrap();
