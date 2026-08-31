import { describe, it, expect, beforeEach } from 'vitest';
import { Compiler } from './compiler';
import { TypeScriptAdapter } from './adapters/typescript/typescript.adapter';
import type { ApplicationDefinition, FrameworkAdapter, CompilationResult } from './codegen-types';

describe('Compiler', () => {
  let compiler: Compiler;

  const createDefinition = (
    overrides: Partial<ApplicationDefinition> = {},
  ): ApplicationDefinition => ({
    name: 'TestApp',
    resources: [
      {
        name: 'Category',
        displayName: 'Category',
        description: 'A product category',
        fields: [
          { name: 'name', displayName: 'Name', type: 'string', required: true },
          { name: 'active', displayName: 'Active', type: 'boolean', required: true },
        ],
      },
    ],
    components: [],
    ...overrides,
  });

  const createMockAdapter = (framework: string = 'mock'): FrameworkAdapter => ({
    framework: framework as never,
    compile: (def, _opts): CompilationResult => ({
      success: true,
      files: [{ path: 'mock.ts', content: 'mock content' }],
      warnings: [],
      errors: [],
      metadata: {
        framework: framework as never,
        resourceCount: def.resources.length,
        componentCount: def.components.length,
        fileCount: 1,
        generatedAt: new Date(),
      },
    }),
    getFileExtensions: () => ['.mock'],
  });

  beforeEach(() => {
    compiler = new Compiler();
  });

  describe('registerAdapter', () => {
    it('should register an adapter', () => {
      compiler.registerAdapter(createMockAdapter());
      expect(compiler.hasAdapter('mock' as never)).toBe(true);
    });

    it('should register multiple adapters', () => {
      compiler.registerAdapter(createMockAdapter('a'));
      compiler.registerAdapter(createMockAdapter('b'));
      expect(compiler.getAvailableFrameworks()).toContain('a');
      expect(compiler.getAvailableFrameworks()).toContain('b');
    });
  });

  describe('compile', () => {
    it('should compile with registered adapter', () => {
      compiler.registerAdapter(createMockAdapter());
      const result = compiler.compile(createDefinition(), { framework: 'mock' as never });

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].path).toBe('mock.ts');
    });

    it('should return error for unregistered framework', () => {
      const result = compiler.compile(createDefinition(), { framework: 'nonexistent' as never });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('No adapter registered');
    });

    it('should validate definition - reject missing name', () => {
      compiler.registerAdapter(createMockAdapter());
      const result = compiler.compile(createDefinition({ name: '' }), {
        framework: 'mock' as never,
      });

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should validate definition - reject non-PascalCase resource name', () => {
      compiler.registerAdapter(createMockAdapter());
      const result = compiler.compile(
        createDefinition({
          resources: [
            {
              name: 'category',
              displayName: 'Category',
              fields: [{ name: 'x', displayName: 'X', type: 'string', required: true }],
            },
          ],
        }),
        { framework: 'mock' as never },
      );

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('PascalCase'))).toBe(true);
    });

    it('should validate definition - reject empty fields', () => {
      compiler.registerAdapter(createMockAdapter());
      const result = compiler.compile(
        createDefinition({
          resources: [{ name: 'Category', displayName: 'Category', fields: [] }],
        }),
        { framework: 'mock' as never },
      );

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('at least one field'))).toBe(true);
    });

    it('should pass options to adapter', () => {
      let receivedOpts: ReturnType<FrameworkAdapter['compile']>['metadata'] | undefined;
      const spy: FrameworkAdapter = {
        ...createMockAdapter(),
        compile: (_def, opts) => {
          receivedOpts = {
            framework: opts.framework,
            fileCount: 0,
            resourceCount: 0,
            componentCount: 0,
            generatedAt: new Date(),
          };
          return {
            success: true,
            files: [],
            warnings: [],
            errors: [],
            metadata: {
              framework: opts.framework,
              fileCount: 0,
              resourceCount: 0,
              componentCount: 0,
              generatedAt: new Date(),
            },
          };
        },
      };

      compiler.registerAdapter(spy);
      compiler.compile(createDefinition(), { framework: 'mock' as never, includeComments: true });

      expect(receivedOpts).toBeDefined();
    });
  });

  describe('getAvailableFrameworks', () => {
    it('should return empty array when no adapters', () => {
      expect(compiler.getAvailableFrameworks()).toHaveLength(0);
    });
  });

  describe('TypeScriptAdapter integration', () => {
    it('should compile with TypeScript adapter', () => {
      compiler.registerAdapter(new TypeScriptAdapter());
      const result = compiler.compile(createDefinition(), { framework: 'typescript' });

      expect(result.success).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files[0].content).toContain('interface Category');
    });
  });
});
