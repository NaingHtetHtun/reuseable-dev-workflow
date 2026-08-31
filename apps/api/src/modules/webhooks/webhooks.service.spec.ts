import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service';
import { TriggersService } from '../triggers/triggers.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { WebhookTriggerHandler } from '@devflow/workflow-core';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let triggersService: TriggersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        TriggersService,
        {
          provide: WorkflowsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 'workflow-1',
              name: 'Test Workflow',
              definition: { nodes: [], edges: [] },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    triggersService = module.get<TriggersService>(TriggersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should reject invalid webhook token', async () => {
      const result = await service.handleWebhook('invalid-token', {}, {});

      expect(result.status).toBe('error');
      expect(result.error).toBe('Invalid webhook token');
    });

    it('should process valid webhook request', async () => {
      // First activate a webhook trigger
      const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
        method: 'POST',
        authentication: 'none',
      });

      // Extract the token from the webhook URL
      const url = activateResult.endpoint!.url;
      const token = url.split('/').pop()!;

      // Send a webhook request
      const result = await service.handleWebhook(token, {}, { event: 'test' });

      expect(result.status).toBe('executed');
      expect(result.executionId).toBeDefined();
    });

    it('should validate HMAC signature when configured', async () => {
      const secret = 'webhook-secret';

      // Activate with HMAC authentication
      const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
        method: 'POST',
        authentication: 'hmac',
        secret,
      });

      const url = activateResult.endpoint!.url;
      const token = url.split('/').pop()!;

      // Generate valid signature
      const payload = JSON.stringify({ event: 'test' });
      const signature = WebhookTriggerHandler.generateSignature(payload, secret);

      // Send with valid signature
      const result = await service.handleWebhook(
        token,
        { 'x-webhook-signature': signature },
        { event: 'test' },
      );

      expect(result.status).toBe('executed');
    });

    it('should reject invalid HMAC signature', async () => {
      const secret = 'webhook-secret';

      const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
        method: 'POST',
        authentication: 'hmac',
        secret,
      });

      const url = activateResult.endpoint!.url;
      const token = url.split('/').pop()!;

      // Send with invalid signature
      const result = await service.handleWebhook(
        token,
        { 'x-webhook-signature': 'sha256=invalidsignature' },
        { event: 'test' },
      );

      expect(result.status).toBe('error');
      expect(result.error).toBe('Invalid webhook signature');
    });

    it('should handle duplicate deliveries (idempotency)', async () => {
      const activateResult = await triggersService.activateTrigger('workflow-1', 'webhook', {
        method: 'POST',
        authentication: 'none',
      });

      const url = activateResult.endpoint!.url;
      const token = url.split('/').pop()!;
      const eventId = 'test-event-1';

      // Send first request
      const result1 = await service.handleWebhook(
        token,
        { 'x-webhook-id': eventId },
        { event: 'test' },
      );

      expect(result1.status).toBe('executed');

      // Send duplicate request
      const result2 = await service.handleWebhook(
        token,
        { 'x-webhook-id': eventId },
        { event: 'test' },
      );

      expect(result2.status).toBe('skipped');
      expect(result2.reason).toBe('duplicate');
    });
  });
});
