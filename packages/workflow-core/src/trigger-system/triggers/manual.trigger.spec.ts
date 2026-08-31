import { manualTriggerDefinition, ManualTriggerHandler } from './manual.trigger';

describe('ManualTriggerHandler', () => {
  let handler: ManualTriggerHandler;

  beforeEach(() => {
    handler = new ManualTriggerHandler();
  });

  describe('definition', () => {
    it('should have correct type', () => {
      expect(manualTriggerDefinition.type).toBe('manual');
    });

    it('should have correct category', () => {
      expect(manualTriggerDefinition.category).toBe('manual');
    });

    it('should not require auth', () => {
      expect(manualTriggerDefinition.requiresAuth).toBe(false);
    });

    it('should not have endpoint', () => {
      expect(manualTriggerDefinition.hasEndpoint).toBe(false);
    });

    it('should support active and draft statuses', () => {
      expect(manualTriggerDefinition.supportedStatuses).toContain('active');
      expect(manualTriggerDefinition.supportedStatuses).toContain('draft');
    });

    it('should have empty config schema', () => {
      expect(manualTriggerDefinition.configSchema.properties).toEqual({});
    });
  });

  describe('type', () => {
    it('should have type "manual"', () => {
      expect(handler.type).toBe('manual');
    });
  });

  describe('validateConfig', () => {
    it('should always return valid', () => {
      const result = handler.validateConfig({});

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid for any config', () => {
      const result = handler.validateConfig({ anything: 'goes' });

      expect(result.valid).toBe(true);
    });
  });

  describe('activate', () => {
    it('should always succeed', async () => {
      const result = await handler.activate('workflow-1', {});

      expect(result.success).toBe(true);
      expect(result.endpoint).toBeUndefined();
    });
  });

  describe('deactivate', () => {
    it('should complete without error', async () => {
      await expect(handler.deactivate('workflow-1')).resolves.toBeUndefined();
    });
  });

  describe('isActive', () => {
    it('should always return true', async () => {
      const active = await handler.isActive('workflow-1');

      expect(active).toBe(true);
    });

    it('should return true for any workflow ID', async () => {
      const active = await handler.isActive('any-workflow-id');

      expect(active).toBe(true);
    });
  });
});
