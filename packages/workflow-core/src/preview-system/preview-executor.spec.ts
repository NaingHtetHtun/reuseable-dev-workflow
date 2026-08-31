import { describe, it, expect, beforeEach } from 'vitest';
import { PreviewExecutor } from './preview-executor';
import type { WorkflowDefinition } from '../types';
import type { WorkflowPreviewRequest } from './preview-types';

describe('PreviewExecutor', () => {
  let executor: PreviewExecutor;

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

  const multiNodeWorkflow: WorkflowDefinition = {
    nodes: [
      {
        id: 'set-1',
        type: 'set-variable',
        name: 'Set Variable',
        parameters: { name: 'greeting', value: 'Hello' },
      },
      {
        id: 'log-1',
        type: 'log',
        name: 'Log Message',
        parameters: { message: '{{input.greeting}} World' },
      },
    ],
    edges: [{ id: 'e1', source: 'set-1', target: 'log-1' }],
  };

  const invalidWorkflow = {
    nodes: [],
    edges: [{ id: 'e1', source: 'missing', target: 'also-missing' }],
  } as unknown as WorkflowDefinition;

  const httpWorkflow: WorkflowDefinition = {
    nodes: [
      {
        id: 'http-1',
        type: 'http-request',
        name: 'HTTP Request',
        parameters: { url: 'https://api.example.com/data', method: 'GET' },
      },
    ],
    edges: [],
  };

  const delayWorkflow: WorkflowDefinition = {
    nodes: [
      {
        id: 'delay-1',
        type: 'delay',
        name: 'Delay',
        parameters: { duration: 5000 },
      },
    ],
    edges: [],
  };

  beforeEach(() => {
    executor = new PreviewExecutor();
  });

  describe('preview', () => {
    it('should validate a valid workflow definition', async () => {
      const result = await executor.preview({
        definition: simpleWorkflow,
        mode: 'validate',
      });

      expect(result.success).toBe(true);
      expect(result.mode).toBe('validate');
      expect(result.validationErrors).toHaveLength(0);
    });

    it('should return errors for invalid workflow definition', async () => {
      const result = await executor.preview({
        definition: invalidWorkflow,
        mode: 'validate',
      });

      expect(result.success).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    it('should perform dry-run and report nodes without executing', async () => {
      const result = await executor.preview({
        definition: multiNodeWorkflow,
        mode: 'dry-run',
      });

      expect(result.success).toBe(true);
      expect(result.mode).toBe('dry-run');
      expect(result.nodeResults).toHaveLength(2);
      expect(result.nodeResults[0].nodeId).toBe('set-1');
      expect(result.nodeResults[1].nodeId).toBe('log-1');
    });

    it('should warn about HTTP requests in dry-run', async () => {
      const result = await executor.preview({
        definition: httpWorkflow,
        mode: 'dry-run',
      });

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('HTTP requests');
    });

    it('should warn about delays in dry-run', async () => {
      const result = await executor.preview({
        definition: delayWorkflow,
        mode: 'dry-run',
      });

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('delays');
    });

    it('should execute a simple workflow in execute mode', async () => {
      const result = await executor.preview({
        definition: simpleWorkflow,
        mode: 'execute',
      });

      expect(result.success).toBe(true);
      expect(result.mode).toBe('execute');
      expect(result.nodeResults).toHaveLength(1);
      expect(result.nodeResults[0].success).toBe(true);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should mock HTTP requests in execute mode', async () => {
      const result = await executor.preview({
        definition: httpWorkflow,
        mode: 'execute',
      });

      expect(result.success).toBe(true);
      expect(result.nodeResults[0].output).toBeDefined();
      const output = result.nodeResults[0].output as Record<string, unknown>;
      expect(output.statusText).toBe('OK (mock)');
    });

    it('should skip delays in execute mode', async () => {
      const result = await executor.preview({
        definition: delayWorkflow,
        mode: 'execute',
      });

      expect(result.success).toBe(true);
      expect(result.nodeResults[0].output).toBeDefined();
      const output = result.nodeResults[0].output as Record<string, unknown>;
      expect(output.skipped).toBe(true);
    });

    it('should return error for unknown preview mode', async () => {
      const result = await executor.preview({
        definition: simpleWorkflow,
        mode: 'unknown' as unknown as WorkflowPreviewRequest['mode'],
      });

      expect(result.success).toBe(false);
      expect(result.validationErrors[0]).toContain('Unknown preview mode');
    });

    it('should execute multi-node workflow in correct order', async () => {
      const result = await executor.preview({
        definition: multiNodeWorkflow,
        mode: 'execute',
      });

      expect(result.success).toBe(true);
      expect(result.nodeResults).toHaveLength(2);
      expect(result.nodeResults[0].nodeId).toBe('set-1');
      expect(result.nodeResults[1].nodeId).toBe('log-1');
    });

    it('should respect maxNodes option', async () => {
      const result = await executor.preview({
        definition: multiNodeWorkflow,
        mode: 'dry-run',
        options: { maxNodes: 1 },
      });

      expect(result.success).toBe(true);
      expect(result.nodeResults).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('maxNodes');
    });
  });

  describe('previewNode', () => {
    it('should preview a single log node', async () => {
      const result = await executor.previewNode(
        simpleWorkflow,
        'log-1',
        { message: 'Test input' },
      );

      expect(result.success).toBe(true);
      expect(result.nodeId).toBe('log-1');
      expect(result.nodeType).toBe('log');
      expect(result.nodeName).toBe('Log Message');
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should return error for non-existent node', async () => {
      const result = await executor.previewNode(
        simpleWorkflow,
        'nonexistent',
        {},
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Node not found');
    });

    it('should return error for unknown node type', async () => {
      const workflowWithUnknown: WorkflowDefinition = {
        nodes: [
          {
            id: 'unknown-1',
            type: 'nonexistent-type',
            name: 'Unknown Node',
            parameters: {},
          },
        ],
        edges: [],
      };

      const result = await executor.previewNode(
        workflowWithUnknown,
        'unknown-1',
        {},
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown node type');
    });

    it('should mock HTTP node in preview', async () => {
      const result = await executor.previewNode(
        httpWorkflow,
        'http-1',
        {},
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      const output = result.output as Record<string, unknown>;
      expect(output.statusText).toBe('OK (mock)');
    });

    it('should mock delay node in preview', async () => {
      const result = await executor.previewNode(
        delayWorkflow,
        'delay-1',
        {},
      );

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      const output = result.output as Record<string, unknown>;
      expect(output.skipped).toBe(true);
    });
  });
});
