import { NodeRegistry } from './registry';
class MockHandler {
  type;
  constructor(type) {
    this.type = type;
  }
  async execute() {
    return { output: null };
  }
}
const mockDefinition = {
  type: 'test-node',
  displayName: 'Test Node',
  description: 'A test node',
  category: 'core',
  version: 1,
  parameterSchema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'A message' },
    },
    required: ['message'],
  },
  inputSchema: { type: 'object', properties: {} },
  outputSchema: { type: 'object', properties: {} },
};
describe('NodeRegistry', () => {
  let registry;
  beforeEach(() => {
    registry = new NodeRegistry();
  });
  describe('register', () => {
    it('should register a node type', () => {
      registry.register(mockDefinition, new MockHandler('test-node'));
      expect(registry.hasType('test-node')).toBe(true);
    });
    it('should reject duplicate registration', () => {
      registry.register(mockDefinition, new MockHandler('test-node'));
      expect(() => registry.register(mockDefinition, new MockHandler('test-node'))).toThrow(
        'already registered',
      );
    });
    it('should reject mismatched types', () => {
      expect(() => registry.register(mockDefinition, new MockHandler('wrong-type'))).toThrow(
        'does not match',
      );
    });
  });
  describe('getDefinition', () => {
    it('should return definition for registered type', () => {
      registry.register(mockDefinition, new MockHandler('test-node'));
      const def = registry.getDefinition('test-node');
      expect(def).toEqual(mockDefinition);
    });
    it('should return undefined for unknown type', () => {
      expect(registry.getDefinition('unknown')).toBeUndefined();
    });
  });
  describe('getHandler', () => {
    it('should return handler for registered type', () => {
      const handler = new MockHandler('test-node');
      registry.register(mockDefinition, handler);
      expect(registry.getHandler('test-node')).toBe(handler);
    });
    it('should return undefined for unknown type', () => {
      expect(registry.getHandler('unknown')).toBeUndefined();
    });
  });
  describe('getAllDefinitions', () => {
    it('should return all registered definitions', () => {
      registry.register(mockDefinition, new MockHandler('test-node'));
      const defs = registry.getAllDefinitions();
      expect(defs).toHaveLength(1);
      expect(defs[0].type).toBe('test-node');
    });
  });
  describe('getByCategory', () => {
    it('should filter by category', () => {
      const coreDef = { ...mockDefinition, category: 'core' };
      const integrationDef = {
        ...mockDefinition,
        type: 'http',
        category: 'integration',
      };
      registry.register(coreDef, new MockHandler('test-node'));
      registry.register(integrationDef, new MockHandler('http'));
      expect(registry.getByCategory('core')).toHaveLength(1);
      expect(registry.getByCategory('integration')).toHaveLength(1);
      expect(registry.getByCategory('unknown')).toHaveLength(0);
    });
  });
  describe('validateParameters', () => {
    it('should accept valid parameters', () => {
      registry.register(mockDefinition, new MockHandler('test-node'));
      const result = registry.validateParameters('test-node', {
        message: 'hello',
      });
      expect(result.valid).toBe(true);
    });
    it('should reject missing required parameters', () => {
      registry.register(mockDefinition, new MockHandler('test-node'));
      const result = registry.validateParameters('test-node', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Missing required');
    });
    it('should reject unknown node type', () => {
      const result = registry.validateParameters('unknown', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Unknown node type');
    });
  });
});
//# sourceMappingURL=node-registry.spec.js.map
