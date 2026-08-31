'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const app_module_1 = require('./app.module');
const http_exception_filter_1 = require('./shared/filters/http-exception.filter');
const logging_interceptor_1 = require('./shared/interceptors/logging.interceptor');
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  const configService = app.get(config_1.ConfigService);
  const logger = new common_1.Logger('Bootstrap');
  app.enableVersioning({
    type: common_1.VersioningType.URI,
    prefix: 'v',
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new common_1.ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
  app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
  app.enableCors();
  const port = configService.get('app.port', 3000);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API available at: http://localhost:${port}/api/v1`);
}
bootstrap();
//# sourceMappingURL=main.js.map
