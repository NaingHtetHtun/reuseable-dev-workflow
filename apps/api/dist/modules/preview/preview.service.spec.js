'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testing_1 = require('@nestjs/testing');
const preview_service_1 = require('./preview.service');
describe('PreviewService', () => {
  let service;
  const simpleWorkflow = {
    nodes: [
      {
        id: 'log-1',
        type: 'log',
        name: 'Log Message',
        parameters: { message: 'Hello from preview' },
      },
    ],
    edges: [],
  };
  const invalidWorkflow = {
    nodes: [],
    edges: [{ id: 'e1', source: 'missing', target: 'also-missing' }],
  };
  beforeEach(async () => {
    const module = await testing_1.Test.createTestingModule({
      providers: [preview_service_1.PreviewService],
    }).compile();
    service = module.get(preview_service_1.PreviewService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('previewWorkflow', () => {
    it('should validate a workflow in validate mode', async () => {
      const result = await service.previewWorkflow(simpleWorkflow, 'validate');
      expect(result.success).toBe(true);
      expect(result.mode).toBe('validate');
      expect(result.validationErrors).toHaveLength(0);
    });
    it('should return errors for invalid workflow', async () => {
      const result = await service.previewWorkflow(invalidWorkflow, 'validate');
      expect(result.success).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });
    it('should execute workflow in execute mode', async () => {
      const result = await service.previewWorkflow(simpleWorkflow, 'execute');
      expect(result.success).toBe(true);
      expect(result.mode).toBe('execute');
      expect(result.nodeResults).toHaveLength(1);
    });
    it('should perform dry-run', async () => {
      const result = await service.previewWorkflow(simpleWorkflow, 'dry-run');
      expect(result.success).toBe(true);
      expect(result.mode).toBe('dry-run');
    });
    it('should pass input to workflow', async () => {
      const result = await service.previewWorkflow(simpleWorkflow, 'execute', { test: true });
      expect(result.success).toBe(true);
    });
  });
  describe('validateWorkflow', () => {
    it('should validate a valid workflow', async () => {
      const result = await service.validateWorkflow(simpleWorkflow);
      expect(result.success).toBe(true);
      expect(result.mode).toBe('validate');
    });
    it('should return errors for invalid workflow', async () => {
      const result = await service.validateWorkflow(invalidWorkflow);
      expect(result.success).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });
  });
  describe('previewNode', () => {
    it('should preview a single node', async () => {
      const result = await service.previewNode(simpleWorkflow, 'log-1', { message: 'Test' });
      expect(result.success).toBe(true);
      expect(result.nodeId).toBe('log-1');
      expect(result.nodeType).toBe('log');
    });
    it('should return error for non-existent node', async () => {
      const result = await service.previewNode(simpleWorkflow, 'nonexistent', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Node not found');
    });
  });
});
//# sourceMappingURL=preview.service.spec.js.map
