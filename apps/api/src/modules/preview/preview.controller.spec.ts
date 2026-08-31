import { Test, TestingModule } from '@nestjs/testing';
import { PreviewController } from './preview.controller';
import { PreviewService } from './preview.service';
import type { WorkflowDefinition } from '@devflow/workflow-core';

describe('PreviewController', () => {
  let controller: PreviewController;

  const simpleWorkflow: WorkflowDefinition = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreviewController],
      providers: [PreviewService],
    }).compile();

    controller = module.get<PreviewController>(PreviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('previewWorkflow', () => {
    it('should preview a workflow', async () => {
      const result = await controller.previewWorkflow({
        definition: simpleWorkflow as unknown as Record<string, unknown>,
        mode: 'validate',
      });

      expect(result.success).toBe(true);
      expect(result.mode).toBe('validate');
    });

    it('should handle execute mode', async () => {
      const result = await controller.previewWorkflow({
        definition: simpleWorkflow as unknown as Record<string, unknown>,
        mode: 'execute',
      });

      expect(result.success).toBe(true);
      expect(result.mode).toBe('execute');
    });

    it('should pass input data', async () => {
      const result = await controller.previewWorkflow({
        definition: simpleWorkflow as unknown as Record<string, unknown>,
        mode: 'execute',
        input: { test: true },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('validateWorkflow', () => {
    it('should validate a workflow', async () => {
      const result = await controller.validateWorkflow({
        definition: simpleWorkflow as unknown as Record<string, unknown>,
        mode: 'validate',
      });

      expect(result.success).toBe(true);
      expect(result.mode).toBe('validate');
    });
  });

  describe('previewNode', () => {
    it('should preview a node', async () => {
      const result = await controller.previewNode({
        definition: simpleWorkflow as unknown as Record<string, unknown>,
        nodeId: 'log-1',
        input: { message: 'Test' },
      });

      expect(result.success).toBe(true);
      expect(result.nodeId).toBe('log-1');
    });

    it('should handle non-existent node', async () => {
      const result = await controller.previewNode({
        definition: simpleWorkflow as unknown as Record<string, unknown>,
        nodeId: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Node not found');
    });
  });
});
