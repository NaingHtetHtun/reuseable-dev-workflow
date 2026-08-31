/**
 * Webhook Trigger
 *
 * HTTP endpoint that triggers workflow execution.
 * Supports HMAC-SHA256 signature validation.
 */
import {
  TriggerTypeDefinition,
  TriggerHandler,
  ValidationResult,
  TriggerActivationResult,
  TriggerEndpointInfo,
} from '../trigger-type.interface';
/**
 * Webhook trigger definition
 */
export declare const webhookTriggerDefinition: TriggerTypeDefinition;
/**
 * Webhook configuration stored per workflow
 */
interface WebhookConfig {
  workflowId: string;
  token: string;
  method: string;
  authentication: string;
  secret?: string;
  path?: string;
}
/**
 * Webhook trigger handler
 *
 * Manages webhook endpoints for workflows.
 * Validates incoming requests using HMAC-SHA256.
 */
export declare class WebhookTriggerHandler implements TriggerHandler {
  readonly type = 'webhook';
  /**
   * In-memory storage for webhook configurations.
   * In production, this would be database-backed.
   */
  private readonly webhooks;
  validateConfig(config: Record<string, unknown>): ValidationResult;
  activate(workflowId: string, config: Record<string, unknown>): Promise<TriggerActivationResult>;
  deactivate(workflowId: string): Promise<void>;
  isActive(workflowId: string): Promise<boolean>;
  getEndpointInfo(workflowId: string): Promise<TriggerEndpointInfo | null>;
  /**
   * Get webhook configuration by token.
   */
  getByToken(token: string): WebhookConfig | undefined;
  /**
   * Validate incoming webhook request using HMAC-SHA256.
   */
  validateRequest(headers: Record<string, string>, body: unknown, secret: string): boolean;
  /**
   * Generate HMAC signature for a payload.
   */
  static generateSignature(payload: string, secret: string): string;
}
export {};
//# sourceMappingURL=webhook.trigger.d.ts.map
