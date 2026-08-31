import { Test, TestingModule } from '@nestjs/testing';
import { TriggersService } from './triggers.service';

describe('TriggersService', () => {
  let service: TriggersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TriggersService],
    }).compile();

    service = module.get<TriggersService>(TriggersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTriggerTypes', () => {
    it('should return built-in trigger types', () => {
      const types = service.getTriggerTypes();

      expect(types).toHaveLength(3);
      expect(types.map((t) => t.type)).toContain('manual');
      expect(types.map((t) => t.type)).toContain('webhook');
      expect(types.map((t) => t.type)).toContain('scheduled');
    });
  });

  describe('getTriggerType', () => {
    it('should return manual trigger type', () => {
      const entry = service.getTriggerType('manual');

      expect(entry).toBeDefined();
      expect(entry!.definition.type).toBe('manual');
    });

    it('should return undefined for unknown type', () => {
      const entry = service.getTriggerType('unknown');

      expect(entry).toBeUndefined();
    });
  });

  describe('validateTriggerConfig', () => {
    it('should validate manual trigger config', () => {
      const result = service.validateTriggerConfig('manual', {});

      expect(result.valid).toBe(true);
    });

    it('should validate webhook trigger config', () => {
      const result = service.validateTriggerConfig('webhook', { method: 'POST' });

      expect(result.valid).toBe(true);
    });

    it('should reject unknown trigger type', () => {
      const result = service.validateTriggerConfig('unknown', {});

      expect(result.valid).toBe(false);
    });
  });

  describe('activateTrigger', () => {
    it('should activate manual trigger', async () => {
      const result = await service.activateTrigger('workflow-1', 'manual', {});

      expect(result.success).toBe(true);
    });

    it('should activate webhook trigger', async () => {
      const result = await service.activateTrigger('workflow-1', 'webhook', {});

      expect(result.success).toBe(true);
      expect(result.endpoint).toBeDefined();
    });

    it('should return error for unknown trigger type', async () => {
      const result = await service.activateTrigger('workflow-1', 'unknown', {});

      expect(result.success).toBe(false);
    });
  });

  describe('deactivateTrigger', () => {
    it('should deactivate trigger without error', async () => {
      await expect(service.deactivateTrigger('workflow-1', 'manual')).resolves.toBeUndefined();
    });
  });

  describe('getTriggerStatus', () => {
    it('should return status for active trigger', async () => {
      await service.activateTrigger('workflow-1', 'manual', {});

      const status = await service.getTriggerStatus('workflow-1', 'manual');

      expect(status).toBeDefined();
      expect(status!.type).toBe('manual');
      expect(status!.active).toBe(true);
    });

    it('should return null for unknown type', async () => {
      const status = await service.getTriggerStatus('workflow-1', 'unknown');

      expect(status).toBeNull();
    });
  });

  describe('getWebhookHandler', () => {
    it('should return webhook handler', () => {
      const handler = service.getWebhookHandler();

      expect(handler).toBeDefined();
      expect(handler!.type).toBe('webhook');
    });
  });
});
