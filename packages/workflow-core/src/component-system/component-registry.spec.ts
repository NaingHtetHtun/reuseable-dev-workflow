import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry } from './component-registry';
import type { ComponentDefinition } from './component-types';

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;

  const createComponent = (overrides: Partial<ComponentDefinition> = {}): ComponentDefinition => ({
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'test-component',
    displayName: 'Test Component',
    description: 'A test component',
    version: '1.0.0',
    status: 'draft',
    category: 'test',
    tags: ['test', 'example'],
    author: 'Test Author',
    projectId: 'project-1',
    configSchema: { type: 'object', properties: {} },
    credentialSchema: { required: [] },
    inputSchema: { type: 'object', properties: {} },
    outputSchema: { type: 'object', properties: {} },
    implementation: { type: 'workflow' },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      versionCount: 1,
      usageCount: 0,
    },
    ...overrides,
  });

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  describe('register', () => {
    it('should register a component', () => {
      const component = createComponent({ id: 'comp-1' });
      registry.register(component);

      expect(registry.has('comp-1')).toBe(true);
      expect(registry.size()).toBe(1);
    });

    it('should overwrite existing component with same ID', () => {
      const component = createComponent({ id: 'comp-1', name: 'v1' });
      registry.register(component);

      const updated = createComponent({ id: 'comp-1', name: 'v2' });
      registry.register(updated);

      expect(registry.size()).toBe(1);
      expect(registry.get('comp-1')?.name).toBe('v2');
    });
  });

  describe('get', () => {
    it('should return component by ID', () => {
      const component = createComponent({ id: 'comp-1' });
      registry.register(component);

      const result = registry.get('comp-1');
      expect(result).toBeDefined();
      expect(result?.id).toBe('comp-1');
    });

    it('should return undefined for non-existent ID', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });
  });

  describe('getByName', () => {
    it('should return component by name within project', () => {
      const component = createComponent({
        id: 'comp-1',
        name: 'my-component',
        projectId: 'project-1',
      });
      registry.register(component);

      const result = registry.getByName('project-1', 'my-component');
      expect(result).toBeDefined();
      expect(result?.id).toBe('comp-1');
    });

    it('should not return component from different project', () => {
      const component = createComponent({
        id: 'comp-1',
        name: 'my-component',
        projectId: 'project-1',
      });
      registry.register(component);

      const result = registry.getByName('project-2', 'my-component');
      expect(result).toBeUndefined();
    });
  });

  describe('getByProject', () => {
    it('should return all components for a project', () => {
      registry.register(createComponent({ id: 'c1', projectId: 'p1' }));
      registry.register(createComponent({ id: 'c2', projectId: 'p1' }));
      registry.register(createComponent({ id: 'c3', projectId: 'p2' }));

      const result = registry.getByProject('p1');
      expect(result).toHaveLength(2);
    });
  });

  describe('getByCategory', () => {
    it('should return components by category', () => {
      registry.register(createComponent({ id: 'c1', category: 'auth' }));
      registry.register(createComponent({ id: 'c2', category: 'crud' }));
      registry.register(createComponent({ id: 'c3', category: 'auth' }));

      const result = registry.getByCategory('auth');
      expect(result).toHaveLength(2);
    });
  });

  describe('getByStatus', () => {
    it('should return components by status', () => {
      registry.register(createComponent({ id: 'c1', status: 'draft' }));
      registry.register(createComponent({ id: 'c2', status: 'published' }));
      registry.register(createComponent({ id: 'c3', status: 'draft' }));

      const result = registry.getByStatus('draft');
      expect(result).toHaveLength(2);
    });
  });

  describe('search', () => {
    it('should search by name', () => {
      registry.register(createComponent({ id: 'c1', name: 'google-login' }));
      registry.register(createComponent({ id: 'c2', name: 'github-login' }));

      const result = registry.search('google');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c1');
    });

    it('should search by displayName', () => {
      registry.register(
        createComponent({
          id: 'c1',
          name: 'comp-1',
          displayName: 'Google Authentication',
        }),
      );

      const result = registry.search('authentication');
      expect(result).toHaveLength(1);
    });

    it('should search by tags', () => {
      registry.register(
        createComponent({
          id: 'c1',
          name: 'comp-1',
          tags: ['google', 'oauth'],
        }),
      );

      const result = registry.search('oauth');
      expect(result).toHaveLength(1);
    });
  });

  describe('validate', () => {
    it('should validate a valid component', () => {
      const result = registry.validate({
        name: 'valid-component',
        displayName: 'Valid Component',
        version: '1.0.0',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing name', () => {
      const result = registry.validate({
        displayName: 'Test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('name');
    });

    it('should reject invalid name format', () => {
      const result = registry.validate({
        name: 'Invalid Name!',
        displayName: 'Test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('lowercase');
    });

    it('should reject missing displayName', () => {
      const result = registry.validate({
        name: 'test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Display name');
    });

    it('should reject invalid version format', () => {
      const result = registry.validate({
        name: 'test',
        displayName: 'Test',
        version: 'v1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('semver');
    });

    it('should reject invalid status', () => {
      const result = registry.validate({
        name: 'test',
        displayName: 'Test',
        status: 'invalid' as unknown as ComponentDefinition['status'],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('draft');
    });
  });

  describe('unregister', () => {
    it('should remove a component', () => {
      registry.register(createComponent({ id: 'comp-1' }));
      expect(registry.has('comp-1')).toBe(true);

      const removed = registry.unregister('comp-1');
      expect(removed).toBe(true);
      expect(registry.has('comp-1')).toBe(false);
    });

    it('should return false for non-existent component', () => {
      expect(registry.unregister('nonexistent')).toBe(false);
    });
  });
});
