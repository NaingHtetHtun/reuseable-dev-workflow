import { TriggerTypeRegistry } from './trigger-type-registry';
import { manualTriggerDefinition, ManualTriggerHandler } from './triggers/manual.trigger';
import { webhookTriggerDefinition, WebhookTriggerHandler } from './triggers/webhook.trigger';
import { scheduledTriggerDefinition, ScheduledTriggerHandler } from './triggers/scheduled.trigger';

describe('TriggerTypeRegistry', () => {
  let registry: TriggerTypeRegistry;

  beforeEach(() => {
    registry = new TriggerTypeRegistry();
  });

  describe('register', () => {
    it('should register a trigger type', () => {
      registry.register(manualTriggerDefinition, new ManualTriggerHandler());

      expect(registry.hasType('manual')).toBe(true);
      expect(registry.size()).toBe(1);
    });

    it('should throw error when registering duplicate type', () => {
      registry.register(manualTriggerDefinition, new ManualTriggerHandler());

      expect(() => {
        registry.register(manualTriggerDefinition, new ManualTriggerHandler());
      }).toThrow("Trigger type 'manual' is already registered");
    });
  });

  describe('get', () => {
    it('should return definition and handler for registered type', () => {
      const handler = new ManualTriggerHandler();
      registry.register(manualTriggerDefinition, handler);

      const entry = registry.get('manual');

      expect(entry).toBeDefined();
      expect(entry!.definition).toBe(manualTriggerDefinition);
      expect(entry!.handler).toBe(handler);
    });

    it('should return undefined for unregistered type', () => {
      const entry = registry.get('nonexistent');

      expect(entry).toBeUndefined();
    });
  });

  describe('hasType', () => {
    it('should return true for registered type', () => {
      registry.register(manualTriggerDefinition, new ManualTriggerHandler());

      expect(registry.hasType('manual')).toBe(true);
    });

    it('should return false for unregistered type', () => {
      expect(registry.hasType('manual')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all registered entries', () => {
      registry.register(manualTriggerDefinition, new ManualTriggerHandler());
      registry.register(webhookTriggerDefinition, new WebhookTriggerHandler());
      registry.register(scheduledTriggerDefinition, new ScheduledTriggerHandler());

      const entries = registry.getAll();

      expect(entries).toHaveLength(3);
      expect(entries.map((e) => e.definition.type)).toEqual(
        expect.arrayContaining(['manual', 'webhook', 'scheduled']),
      );
    });

    it('should return empty array when no types registered', () => {
      const entries = registry.getAll();

      expect(entries).toHaveLength(0);
    });
  });

  describe('getDefinitions', () => {
    it('should return all definitions without handlers', () => {
      registry.register(manualTriggerDefinition, new ManualTriggerHandler());
      registry.register(webhookTriggerDefinition, new WebhookTriggerHandler());

      const definitions = registry.getDefinitions();

      expect(definitions).toHaveLength(2);
      expect(definitions[0]).toHaveProperty('type');
      expect(definitions[0]).toHaveProperty('displayName');
      expect(definitions[0]).not.toHaveProperty('handler');
    });
  });

  describe('getByCategory', () => {
    it('should filter definitions by category', () => {
      registry.register(manualTriggerDefinition, new ManualTriggerHandler());
      registry.register(webhookTriggerDefinition, new WebhookTriggerHandler());
      registry.register(scheduledTriggerDefinition, new ScheduledTriggerHandler());

      const httpTriggers = registry.getByCategory('http');
      const manualTriggers = registry.getByCategory('manual');

      expect(httpTriggers).toHaveLength(1);
      expect(httpTriggers[0].type).toBe('webhook');
      expect(manualTriggers).toHaveLength(1);
      expect(manualTriggers[0].type).toBe('manual');
    });
  });

  describe('getHandler', () => {
    it('should return handler for registered type', () => {
      const handler = new ManualTriggerHandler();
      registry.register(manualTriggerDefinition, handler);

      expect(registry.getHandler('manual')).toBe(handler);
    });

    it('should return undefined for unregistered type', () => {
      expect(registry.getHandler('nonexistent')).toBeUndefined();
    });
  });

  describe('unregister', () => {
    it('should remove a registered type', () => {
      registry.register(manualTriggerDefinition, new ManualTriggerHandler());

      const removed = registry.unregister('manual');

      expect(removed).toBe(true);
      expect(registry.hasType('manual')).toBe(false);
      expect(registry.size()).toBe(0);
    });

    it('should return false when removing unregistered type', () => {
      const removed = registry.unregister('nonexistent');

      expect(removed).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct count', () => {
      expect(registry.size()).toBe(0);

      registry.register(manualTriggerDefinition, new ManualTriggerHandler());
      expect(registry.size()).toBe(1);

      registry.register(webhookTriggerDefinition, new WebhookTriggerHandler());
      expect(registry.size()).toBe(2);
    });
  });
});
