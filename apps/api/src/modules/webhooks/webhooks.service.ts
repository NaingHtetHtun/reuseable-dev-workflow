import { Injectable, Logger } from '@nestjs/common';
import { TriggersService } from '../triggers/triggers.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { randomUUID } from 'crypto';

export interface WebhookExecutionResult {
  status: 'executed' | 'skipped' | 'error';
  executionId?: string;
  reason?: string;
  error?: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  /** In-memory deduplication store. In production, use Redis. */
  private readonly processedEvents = new Map<string, number>();
  private readonly deduplicationWindowMs = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly triggersService: TriggersService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  /**
   * Process an incoming webhook request.
   */
  async handleWebhook(
    token: string,
    headers: Record<string, string>,
    body: unknown,
  ): Promise<WebhookExecutionResult> {
    // Find the webhook handler
    const webhookHandler = this.triggersService.getWebhookHandler();
    if (!webhookHandler) {
      return { status: 'error', error: 'Webhook handler not available' };
    }

    // Find the webhook configuration by token
    const webhookConfig = webhookHandler.getByToken(token);
    if (!webhookConfig) {
      return { status: 'error', error: 'Invalid webhook token' };
    }

    // Validate HMAC signature if authentication is configured
    if (webhookConfig.authentication === 'secret' || webhookConfig.authentication === 'hmac') {
      if (!webhookConfig.secret) {
        this.logger.warn(`Webhook ${token} has auth configured but no secret`);
        return { status: 'error', error: 'Webhook secret not configured' };
      }

      const isValid = webhookHandler.validateRequest(headers, body, webhookConfig.secret);
      if (!isValid) {
        return { status: 'error', error: 'Invalid webhook signature' };
      }
    }

    // Check idempotency
    const eventId = headers['x-webhook-id'] || randomUUID();
    const deduplicationKey = `${webhookConfig.workflowId}:${eventId}`;

    if (this.isDuplicate(deduplicationKey)) {
      return { status: 'skipped', reason: 'duplicate' };
    }

    // Mark as processed
    this.markProcessed(deduplicationKey);

    try {
      // Get the workflow definition
      const workflow = await this.workflowsService.findOne(
        webhookConfig.workflowId,
        webhookConfig.workflowId,
      );
      if (!workflow) {
        return { status: 'error', error: 'Workflow not found' };
      }

      this.logger.log(
        `Webhook triggered workflow ${webhookConfig.workflowId} via event ${eventId}`,
      );

      return {
        status: 'executed',
        executionId: eventId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Webhook execution failed: ${message}`);
      return { status: 'error', error: message };
    }
  }

  /**
   * Check if an event has already been processed (idempotency).
   */
  private isDuplicate(key: string): boolean {
    const processedAt = this.processedEvents.get(key);
    if (!processedAt) return false;

    // Check if within deduplication window
    if (Date.now() - processedAt > this.deduplicationWindowMs) {
      this.processedEvents.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Mark an event as processed.
   */
  private markProcessed(key: string): void {
    this.processedEvents.set(key, Date.now());

    // Cleanup old entries periodically
    if (this.processedEvents.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.processedEvents) {
        if (now - v > this.deduplicationWindowMs) {
          this.processedEvents.delete(k);
        }
      }
    }
  }
}
