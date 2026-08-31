import { Injectable } from '@nestjs/common';
import {
  TriggerTypeRegistry,
  ManualTriggerHandler,
  WebhookTriggerHandler,
  ScheduledTriggerHandler,
} from '@devflow/workflow-core';
import type {
  TriggerTypeDefinition,
  TriggerHandler,
  TriggerActivationResult,
  TriggerEndpointInfo,
  ValidationResult,
} from '@devflow/workflow-core';

export interface TriggerConfig {
  type: string;
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface TriggerStatus {
  workflowId: string;
  type: string;
  enabled: boolean;
  active: boolean;
  endpoint?: TriggerEndpointInfo;
}

@Injectable()
export class TriggersService {
  private readonly registry: TriggerTypeRegistry;

  constructor() {
    this.registry = new TriggerTypeRegistry();
    this.registerBuiltInTriggers();
  }

  private registerBuiltInTriggers(): void {
    const manualDef = {
      type: 'manual',
      displayName: 'Manual Trigger',
      description: 'Execute workflow manually via API call',
      category: 'manual',
      version: 1,
      configSchema: { type: 'object' as const, properties: {} },
      outputSchema: { type: 'object' as const, properties: { input: { type: 'object' } } },
      requiresAuth: false,
      hasEndpoint: false,
      supportedStatuses: ['active', 'draft'],
    };
    this.registry.register(manualDef, new ManualTriggerHandler());

    const webhookDef: TriggerTypeDefinition = {
      type: 'webhook',
      displayName: 'Webhook Trigger',
      description: 'Execute workflow when HTTP request is received',
      category: 'http',
      version: 1,
      configSchema: {
        type: 'object',
        properties: {
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            default: 'POST',
          },
          path: { type: 'string', description: 'Custom path suffix' },
          authentication: { type: 'string', enum: ['none', 'secret', 'hmac'], default: 'secret' },
          secret: { type: 'string', description: 'Webhook secret for validation' },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          method: { type: 'string' },
          headers: { type: 'object' },
          query: { type: 'object' },
          body: { type: 'object' },
          path: { type: 'string' },
        },
      },
      requiresAuth: false,
      hasEndpoint: true,
      supportedStatuses: ['active'],
    };
    this.registry.register(webhookDef, new WebhookTriggerHandler());

    const scheduledDef: TriggerTypeDefinition = {
      type: 'scheduled',
      displayName: 'Scheduled Trigger',
      description: 'Execute workflow on a cron schedule',
      category: 'schedule',
      version: 1,
      configSchema: {
        type: 'object',
        properties: {
          cron: { type: 'string', description: 'Cron expression (e.g., "0 9 * * 1-5")' },
          timezone: { type: 'string', description: 'Timezone for cron expression', default: 'UTC' },
        },
        required: ['cron'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          scheduledTime: { type: 'string' },
          triggeredAt: { type: 'string' },
        },
      },
      requiresAuth: false,
      hasEndpoint: false,
      supportedStatuses: ['active'],
    };
    this.registry.register(scheduledDef, new ScheduledTriggerHandler());
  }

  getTriggerTypes(): TriggerTypeDefinition[] {
    return this.registry.getDefinitions();
  }

  getTriggerType(
    type: string,
  ): { definition: TriggerTypeDefinition; handler: TriggerHandler } | undefined {
    return this.registry.get(type);
  }

  validateTriggerConfig(type: string, config: Record<string, unknown>): ValidationResult {
    const entry = this.registry.get(type);
    if (!entry) {
      return { valid: false, errors: [`Unknown trigger type: ${type}`] };
    }
    return entry.handler.validateConfig(config);
  }

  async activateTrigger(
    workflowId: string,
    type: string,
    config: Record<string, unknown>,
  ): Promise<TriggerActivationResult> {
    const entry = this.registry.get(type);
    if (!entry) {
      return { success: false, error: `Unknown trigger type: ${type}` };
    }
    return entry.handler.activate(workflowId, config);
  }

  async deactivateTrigger(workflowId: string, type: string): Promise<void> {
    const entry = this.registry.get(type);
    if (entry) {
      await entry.handler.deactivate(workflowId);
    }
  }

  async getTriggerStatus(workflowId: string, type: string): Promise<TriggerStatus | null> {
    const entry = this.registry.get(type);
    if (!entry) return null;

    const active = await entry.handler.isActive(workflowId);
    let endpoint: TriggerEndpointInfo | undefined | null;
    if (entry.handler.getEndpointInfo) {
      endpoint = await entry.handler.getEndpointInfo(workflowId);
    }

    return {
      workflowId,
      type,
      enabled: true,
      active,
      endpoint: endpoint ?? undefined,
    };
  }

  getWebhookHandler(): WebhookTriggerHandler | undefined {
    const entry = this.registry.get('webhook');
    return entry?.handler as WebhookTriggerHandler | undefined;
  }
}
