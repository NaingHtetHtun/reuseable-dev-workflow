import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
  private readonly webhooksService;
  constructor(webhooksService: WebhooksService);
  handleWebhook(
    token: string,
    headers: Record<string, string>,
    body: unknown,
  ): Promise<import('./webhooks.service').WebhookExecutionResult>;
}
