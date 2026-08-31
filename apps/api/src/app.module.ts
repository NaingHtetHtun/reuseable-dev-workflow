import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { OAuthModule } from './modules/oauth/oauth.module';
import { TriggersModule } from './modules/triggers/triggers.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { PreviewModule } from './modules/preview/preview.module';
import { ComponentsModule } from './modules/components/components.module';
import { ResourcesModule } from './modules/resources/resources.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    ProjectsModule,
    WorkflowsModule,
    CredentialsModule,
    OAuthModule,
    TriggersModule,
    WebhooksModule,
    PreviewModule,
    ComponentsModule,
    ResourcesModule,
  ],
})
export class AppModule {}
