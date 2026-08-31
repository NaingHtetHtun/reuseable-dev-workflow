/**
 * Webhook Trigger
 *
 * HTTP endpoint that triggers workflow execution.
 * Supports HMAC-SHA256 signature validation.
 */
import * as crypto from 'crypto';
/**
 * Webhook trigger definition
 */
export const webhookTriggerDefinition = {
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
        description: 'HTTP method to accept',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        default: 'POST',
      },
      path: {
        type: 'string',
        description: 'Custom path suffix (auto-generated if empty)',
      },
      authentication: {
        type: 'string',
        description: 'Authentication method',
        enum: ['none', 'secret', 'hmac'],
        default: 'secret',
      },
      secret: {
        type: 'string',
        description: 'Webhook secret for validation',
      },
    },
    required: [],
  },
  outputSchema: {
    type: 'object',
    properties: {
      method: { type: 'string', description: 'HTTP method' },
      headers: { type: 'object', description: 'HTTP headers' },
      query: { type: 'object', description: 'Query parameters' },
      body: { type: 'object', description: 'Request body' },
      path: { type: 'string', description: 'Request path' },
    },
  },
  requiresAuth: false,
  hasEndpoint: true,
  supportedStatuses: ['active'],
};
/**
 * Webhook trigger handler
 *
 * Manages webhook endpoints for workflows.
 * Validates incoming requests using HMAC-SHA256.
 */
export class WebhookTriggerHandler {
  type = 'webhook';
  /**
   * In-memory storage for webhook configurations.
   * In production, this would be database-backed.
   */
  webhooks = new Map();
  validateConfig(config) {
    const errors = [];
    // Validate authentication method
    const auth = config.authentication;
    if (auth && !['none', 'secret', 'hmac'].includes(auth)) {
      errors.push(`Invalid authentication method: ${auth}`);
    }
    // Validate secret if authentication is 'secret' or 'hmac'
    if (auth === 'secret' || auth === 'hmac') {
      const secret = config.secret;
      if (!secret || typeof secret !== 'string') {
        errors.push('Secret is required for secret/hmac authentication');
      }
    }
    // Validate method
    const method = config.method;
    if (method && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      errors.push(`Invalid HTTP method: ${method}`);
    }
    return { valid: errors.length === 0, errors };
  }
  async activate(workflowId, config) {
    // Generate unique token for webhook URL
    const token = crypto.randomBytes(16).toString('hex');
    const webhookConfig = {
      workflowId,
      token,
      method: config.method || 'POST',
      authentication: config.authentication || 'secret',
      secret: config.secret,
      path: config.path,
    };
    this.webhooks.set(workflowId, webhookConfig);
    const baseUrl = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/v1/webhooks/${token}`;
    return {
      success: true,
      endpoint: {
        url,
        method: webhookConfig.method,
        headers: { 'Content-Type': 'application/json' },
        secret: webhookConfig.secret,
      },
    };
  }
  async deactivate(workflowId) {
    this.webhooks.delete(workflowId);
  }
  async isActive(workflowId) {
    return this.webhooks.has(workflowId);
  }
  async getEndpointInfo(workflowId) {
    const config = this.webhooks.get(workflowId);
    if (!config) {
      return null;
    }
    const baseUrl = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';
    return {
      url: `${baseUrl}/api/v1/webhooks/${config.token}`,
      method: config.method,
      headers: { 'Content-Type': 'application/json' },
      secret: config.secret,
    };
  }
  /**
   * Get webhook configuration by token.
   */
  getByToken(token) {
    for (const config of this.webhooks.values()) {
      if (config.token === token) {
        return config;
      }
    }
    return undefined;
  }
  /**
   * Validate incoming webhook request using HMAC-SHA256.
   */
  validateRequest(headers, body, secret) {
    const signature = headers['x-webhook-signature'] || headers['x-hub-signature-256'];
    if (!signature) {
      return false;
    }
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // Remove sha256= prefix if present
    const signatureHex = signature.replace('sha256=', '');
    // Check if signature has correct length (64 hex chars = 32 bytes)
    if (signatureHex.length !== expectedSignature.length) {
      return false;
    }
    // Constant-time comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signatureHex, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch {
      return false;
    }
  }
  /**
   * Generate HMAC signature for a payload.
   */
  static generateSignature(payload, secret) {
    return `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
  }
}
//# sourceMappingURL=webhook.trigger.js.map
