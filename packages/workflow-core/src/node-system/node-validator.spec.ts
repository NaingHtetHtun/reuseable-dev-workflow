import { NodeRegistry } from './registry';
import { validateNode, validateAllNodes } from './validator';
import { logDefinition, LogNodeHandler } from './builtin/log.node';
import { WorkflowNode } from '../types';

describe('NodeValidator', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
    registry.register(logDefinition, new LogNodeHandler());
  });

  describe('validateNode', () => {
    it('should accept valid node', () => {
      const node: WorkflowNode = {
        id: 'n1',
        type: 'log',
        name: 'Log',
        parameters: { message: 'hello' },
      };
      const result = validateNode(node, registry);
      expect(result.valid).toBe(true);
    });

    it('should reject unknown node type', () => {
      const node: WorkflowNode = {
        id: 'n1',
        type: 'unknown',
        name: 'Unknown',
        parameters: {},
      };
      const result = validateNode(node, registry);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Unknown node type');
    });

    it('should reject missing required parameters', () => {
      const node: WorkflowNode = {
        id: 'n1',
        type: 'log',
        name: 'Log',
        parameters: {},
      };
      const result = validateNode(node, registry);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Missing required');
    });
  });

  describe('validateAllNodes', () => {
    it('should accept all valid nodes', () => {
      const nodes: WorkflowNode[] = [
        { id: 'n1', type: 'log', name: 'Log 1', parameters: { message: 'a' } },
        { id: 'n2', type: 'log', name: 'Log 2', parameters: { message: 'b' } },
      ];
      const result = validateAllNodes(nodes, registry);
      expect(result.valid).toBe(true);
    });

    it('should report errors for invalid nodes', () => {
      const nodes: WorkflowNode[] = [
        { id: 'n1', type: 'log', name: 'Log', parameters: { message: 'ok' } },
        { id: 'n2', type: 'unknown', name: 'Bad', parameters: {} },
      ];
      const result = validateAllNodes(nodes, registry);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
