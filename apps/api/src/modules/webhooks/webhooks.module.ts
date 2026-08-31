import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { TriggersModule } from '../triggers/triggers.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [TriggersModule, WorkflowsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
