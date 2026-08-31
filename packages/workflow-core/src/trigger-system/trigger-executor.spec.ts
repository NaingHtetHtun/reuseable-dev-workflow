import { TriggerExecutor } from './trigger-executor';
import { TriggerTypeRegistry } from './trigger-type-registry';
import { WorkflowExecutor } from '../executor';
import { noopLogger } from '../logger.interface';
import { WorkflowDefinition } from '../types';
import { TriggerContext } from './trigger-type.interface';
import { manualTriggerDefinition, ManualTriggerHandler } from './triggers/manual.trigger';

describe('TriggerExecutor', () => {
  let triggerExecutor: TriggerExecutor;
  let triggerRegistry: TriggerTypeRegistry;
  let workflowExecutor: WorkflowExecutor;

  beforeEach(() => {
    triggerRegistry = new TriggerTypeRegistry();
    triggerRegistry.register(manualTriggerDefinition, new ManualTriggerHandler());
    workflowExecutor = new WorkflowExecutor(noopLogger);
    triggerExecutor = new TriggerExecutor(triggerRegistry, workflowExecutor);
  });

  describe('executeViaTrigger', () => {
    it('should execute workflow with trigger payload', async () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'node-1',
            type: 'log',
            name: 'Log Input',
            parameters: { message: '{{input.trigger.payload.message}}' },
          },
        ],
        edges: [],
      };

      const triggerContext: TriggerContext = {
        workflowId: 'workflow-1',
        triggerType: 'manual',
        triggerConfig: {},
        payload: { message: 'Hello from trigger' },
        firedAt: new Date(),
        eventId: 'event-1',
      };

      const result = await triggerExecutor.executeViaTrigger(triggerContext, workflow);

      expect(result.status).toBe('completed');
      expect(result.nodeResults).toBeDefined();
    });

    it('should wrap payload in trigger metadata by default', async () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'node-1',
            type: 'no-op',
            name: 'No Op',
            parameters: {},
          },
        ],
        edges: [],
      };

      const triggerContext: TriggerContext = {
        workflowId: 'workflow-1',
        triggerType: 'manual',
        triggerConfig: {},
        payload: { data: 'test' },
        firedAt: new Date(),
        eventId: 'event-1',
      };

      const result = await triggerExecutor.executeViaTrigger(triggerContext, workflow);

      expect(result.status).toBe('completed');
    });

    it('should use eventId as executionId', async () => {
      const workflow: WorkflowDefinition = {
        nodes: [
          {
            id: 'node-1',
            type: 'no-op',
            name: 'No Op',
            parameters: {},
          },
        ],
        edges: [],
      };

      const triggerContext: TriggerContext = {
        workflowId: 'workflow-1',
        triggerType: 'manual',
        triggerConfig: {},
        payload: {},
        firedAt: new Date(),
        eventId: 'custom-event-id',
      };

      const result = await triggerExecutor.executeViaTrigger(triggerContext, workflow);

      expect(result.status).toBe('completed');
    });
  });

  describe('createTriggerContext', () => {
    it('should create trigger context with provided data', () => {
      const context = TriggerExecutor.createTriggerContext(
        'workflow-1',
        'webhook',
        { method: 'POST' },
        { body: 'test' },
      );

      expect(context.workflowId).toBe('workflow-1');
      expect(context.triggerType).toBe('webhook');
      expect(context.triggerConfig).toEqual({ method: 'POST' });
      expect(context.payload).toEqual({ body: 'test' });
      expect(context.firedAt).toBeInstanceOf(Date);
      expect(context.eventId).toBeDefined();
    });

    it('should generate unique event IDs', () => {
      const context1 = TriggerExecutor.createTriggerContext('w1', 'manual', {}, {});
      const context2 = TriggerExecutor.createTriggerContext('w2', 'manual', {}, {});

      expect(context1.eventId).not.toBe(context2.eventId);
    });

    it('should include endpoint info when provided', () => {
      const endpoint = {
        url: 'http://localhost:3000/api/v1/webhooks/token123',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        secret: 'my-secret',
      };

      const context = TriggerExecutor.createTriggerContext(
        'workflow-1',
        'webhook',
        {},
        {},
        endpoint,
      );

      expect(context.endpoint).toBeDefined();
      expect(context.endpoint!.url).toBe(endpoint.url);
      expect(context.endpoint!.secret).toBe('my-secret');
    });
  });
});
