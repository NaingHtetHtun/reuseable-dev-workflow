import { webhookTriggerDefinition, WebhookTriggerHandler } from './webhook.trigger';
import * as crypto from 'crypto';

describe('WebhookTriggerHandler', () => {
  let handler: WebhookTriggerHandler;

  beforeEach(() => {
    handler = new WebhookTriggerHandler();
  });

  describe('definition', () => {
    it('should have correct type', () => {
      expect(webhookTriggerDefinition.type).toBe('webhook');
    });

    it('should have correct category', () => {
      expect(webhookTriggerDefinition.category).toBe('http');
    });

    it('should have endpoint', () => {
      expect(webhookTriggerDefinition.hasEndpoint).toBe(true);
    });

    it('should only support active status', () => {
      expect(webhookTriggerDefinition.supportedStatuses).toEqual(['active']);
    });
  });

  describe('type', () => {
    it('should have type "webhook"', () => {
      expect(handler.type).toBe('webhook');
    });
  });

  describe('validateConfig', () => {
    it('should return valid for empty config', () => {
      const result = handler.validateConfig({});

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid for valid POST config', () => {
      const result = handler.validateConfig({ method: 'POST' });

      expect(result.valid).toBe(true);
    });

    it('should return valid for secret authentication', () => {
      const result = handler.validateConfig({
        authentication: 'secret',
        secret: 'my-secret',
      });

      expect(result.valid).toBe(true);
    });

    it('should return valid for hmac authentication', () => {
      const result = handler.validateConfig({
        authentication: 'hmac',
        secret: 'my-secret',
      });

      expect(result.valid).toBe(true);
    });

    it('should reject invalid authentication method', () => {
      const result = handler.validateConfig({ authentication: 'invalid' });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid authentication method: invalid');
    });

    it('should reject secret authentication without secret', () => {
      const result = handler.validateConfig({ authentication: 'secret' });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret is required for secret/hmac authentication');
    });

    it('should reject hmac authentication without secret', () => {
      const result = handler.validateConfig({ authentication: 'hmac' });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret is required for secret/hmac authentication');
    });

    it('should reject invalid HTTP method', () => {
      const result = handler.validateConfig({ method: 'INVALID' });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid HTTP method: INVALID');
    });

    it('should accept all valid HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

      for (const method of methods) {
        const result = handler.validateConfig({ method });
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('activate', () => {
    it('should generate webhook URL', async () => {
      const result = await handler.activate('workflow-1', {});

      expect(result.success).toBe(true);
      expect(result.endpoint).toBeDefined();
      expect(result.endpoint!.url).toContain('/api/v1/webhooks/');
    });

    it('should generate unique tokens', async () => {
      const result1 = await handler.activate('workflow-1', {});
      const result2 = await handler.activate('workflow-2', {});

      const token1 = result1.endpoint!.url.split('/').pop();
      const token2 = result2.endpoint!.url.split('/').pop();

      expect(token1).not.toBe(token2);
    });

    it('should use default POST method', async () => {
      const result = await handler.activate('workflow-1', {});

      expect(result.endpoint!.method).toBe('POST');
    });

    it('should use custom method', async () => {
      const result = await handler.activate('workflow-1', { method: 'GET' });

      expect(result.endpoint!.method).toBe('GET');
    });

    it('should include secret in endpoint', async () => {
      const result = await handler.activate('workflow-1', {
        authentication: 'secret',
        secret: 'my-secret',
      });

      expect(result.endpoint!.secret).toBe('my-secret');
    });
  });

  describe('deactivate', () => {
    it('should remove webhook configuration', async () => {
      await handler.activate('workflow-1', {});
      expect(await handler.isActive('workflow-1')).toBe(true);

      await handler.deactivate('workflow-1');
      expect(await handler.isActive('workflow-1')).toBe(false);
    });

    it('should not error when deactivating non-existent webhook', async () => {
      await expect(handler.deactivate('nonexistent')).resolves.toBeUndefined();
    });
  });

  describe('isActive', () => {
    it('should return false when not activated', async () => {
      const active = await handler.isActive('workflow-1');

      expect(active).toBe(false);
    });

    it('should return true after activation', async () => {
      await handler.activate('workflow-1', {});

      const active = await handler.isActive('workflow-1');

      expect(active).toBe(true);
    });
  });

  describe('getEndpointInfo', () => {
    it('should return null when not activated', async () => {
      const info = await handler.getEndpointInfo('workflow-1');

      expect(info).toBeNull();
    });

    it('should return endpoint info when activated', async () => {
      await handler.activate('workflow-1', { method: 'POST' });

      const info = await handler.getEndpointInfo('workflow-1');

      expect(info).toBeDefined();
      expect(info!.url).toContain('/api/v1/webhooks/');
      expect(info!.method).toBe('POST');
    });
  });

  describe('getByToken', () => {
    it('should return webhook config by token', async () => {
      const result = await handler.activate('workflow-1', {});
      const token = result.endpoint!.url.split('/').pop()!;

      const config = handler.getByToken(token);

      expect(config).toBeDefined();
      expect(config!.workflowId).toBe('workflow-1');
    });

    it('should return undefined for invalid token', () => {
      const config = handler.getByToken('invalid-token');

      expect(config).toBeUndefined();
    });
  });

  describe('validateRequest', () => {
    it('should validate valid HMAC signature', () => {
      const secret = 'webhook-secret';
      const payload = JSON.stringify({ event: 'test' });
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const headers = { 'x-webhook-signature': `sha256=${signature}` };

      const valid = handler.validateRequest(headers, payload, secret);

      expect(valid).toBe(true);
    });

    it('should reject missing signature', () => {
      const headers = {};
      const payload = JSON.stringify({ event: 'test' });

      const valid = handler.validateRequest(headers, payload, 'secret');

      expect(valid).toBe(false);
    });

    it('should reject invalid signature', () => {
      const headers = { 'x-webhook-signature': 'sha256=invalidsignature' };
      const payload = JSON.stringify({ event: 'test' });

      const valid = handler.validateRequest(headers, payload, 'secret');

      expect(valid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const secret = 'correct-secret';
      const payload = JSON.stringify({ event: 'test' });
      const signature = crypto.createHmac('sha256', 'wrong-secret').update(payload).digest('hex');

      const headers = { 'x-webhook-signature': `sha256=${signature}` };

      const valid = handler.validateRequest(headers, payload, secret);

      expect(valid).toBe(false);
    });

    it('should accept x-hub-signature-256 header', () => {
      const secret = 'webhook-secret';
      const payload = JSON.stringify({ event: 'test' });
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const headers = { 'x-hub-signature-256': `sha256=${signature}` };

      const valid = handler.validateRequest(headers, payload, secret);

      expect(valid).toBe(true);
    });

    it('should handle object payload by stringifying', () => {
      const secret = 'webhook-secret';
      const payload = { event: 'test' };
      const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const headers = { 'x-webhook-signature': `sha256=${signature}` };

      const valid = handler.validateRequest(headers, payload, secret);

      expect(valid).toBe(true);
    });
  });

  describe('generateSignature', () => {
    it('should generate valid signature', () => {
      const payload = 'test-payload';
      const secret = 'test-secret';

      const signature = WebhookTriggerHandler.generateSignature(payload, secret);

      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = 'test-payload';

      const sig1 = WebhookTriggerHandler.generateSignature(payload, 'secret1');
      const sig2 = WebhookTriggerHandler.generateSignature(payload, 'secret2');

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const secret = 'test-secret';

      const sig1 = WebhookTriggerHandler.generateSignature('payload1', secret);
      const sig2 = WebhookTriggerHandler.generateSignature('payload2', secret);

      expect(sig1).not.toBe(sig2);
    });
  });
});
