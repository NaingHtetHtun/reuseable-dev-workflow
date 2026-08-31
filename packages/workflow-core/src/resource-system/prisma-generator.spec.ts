import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaGenerator } from './prisma-generator';
import type { ResourceDefinition, ResourceField } from './resource-types';

describe('PrismaGenerator', () => {
  let generator: PrismaGenerator;

  const createResource = (overrides: Partial<ResourceDefinition> = {}): ResourceDefinition => ({
    id: 'res-1',
    name: 'Category',
    displayName: 'Category',
    version: '1.0.0',
    status: 'draft',
    projectId: 'project-1',
    fields: [
      { name: 'name', displayName: 'Name', type: 'string', required: true, maxLength: 255 },
      { name: 'description', displayName: 'Description', type: 'text', required: false },
      { name: 'active', displayName: 'Active', type: 'boolean', required: true, default: true },
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      versionCount: 1,
    },
    ...overrides,
  });

  beforeEach(() => {
    generator = new PrismaGenerator();
  });

  describe('generateModel', () => {
    it('should generate a basic Prisma model', () => {
      const resource = createResource();
      const output = generator.generateModel(resource);

      expect(output).toContain('model Category {');
      expect(output).toContain('id        String   @id @default(uuid())');
      expect(output).toContain('name');
      expect(output).toContain('description');
      expect(output).toContain('active');
      expect(output).toContain('createdAt DateTime @default(now()) @map("created_at")');
      expect(output).toContain('updatedAt DateTime @updatedAt @map("updated_at")');
      expect(output).toContain('@@map("category")');
    });

    it('should use custom table name when provided', () => {
      const resource = createResource({ tableName: 'categories' });
      const output = generator.generateModel(resource);

      expect(output).toContain('@@map("categories")');
    });

    it('should handle required fields', () => {
      const resource = createResource({
        fields: [{ name: 'title', displayName: 'Title', type: 'string', required: true }],
      });
      const output = generator.generateModel(resource);

      expect(output).toContain('title');
      // Required string fields don't have ?
      expect(output).not.toMatch(/title.*String\?/);
    });

    it('should handle optional fields with ?', () => {
      const resource = createResource({
        fields: [{ name: 'subtitle', displayName: 'Subtitle', type: 'string', required: false }],
      });
      const output = generator.generateModel(resource);

      expect(output).toContain('subtitle');
      expect(output).toMatch(/subtitle.*String\?/);
    });

    it('should handle unique fields', () => {
      const resource = createResource({
        fields: [
          { name: 'email', displayName: 'Email', type: 'string', required: true, unique: true },
        ],
      });
      const output = generator.generateModel(resource);

      expect(output).toContain('@unique');
    });

    it('should handle default values', () => {
      const resource = createResource({
        fields: [
          {
            name: 'status',
            displayName: 'Status',
            type: 'string',
            required: true,
            default: 'active',
          },
        ],
      });
      const output = generator.generateModel(resource);

      expect(output).toContain('@default("active")');
    });

    it('should handle boolean defaults', () => {
      const resource = createResource({
        fields: [
          {
            name: 'visible',
            displayName: 'Visible',
            type: 'boolean',
            required: true,
            default: true,
          },
        ],
      });
      const output = generator.generateModel(resource);

      expect(output).toContain('@default(true)');
    });

    it('should map all field types correctly', () => {
      const fields: ResourceField[] = [
        { name: 'f_string', displayName: 'String', type: 'string', required: true },
        { name: 'f_text', displayName: 'Text', type: 'text', required: true },
        { name: 'f_bool', displayName: 'Bool', type: 'boolean', required: true },
        { name: 'f_int', displayName: 'Int', type: 'integer', required: true },
        { name: 'f_float', displayName: 'Float', type: 'float', required: true },
        { name: 'f_time', displayName: 'Time', type: 'timestamp', required: true },
        { name: 'f_json', displayName: 'Json', type: 'json', required: true },
        { name: 'f_enum', displayName: 'Enum', type: 'enum', required: true },
        { name: 'f_rel', displayName: 'Rel', type: 'relation', required: true },
      ];

      const resource = createResource({ fields });
      const output = generator.generateModel(resource);

      expect(output).toContain('f_string');
      expect(output).toContain('String');
      expect(output).toContain('f_text');
      expect(output).toContain('f_bool');
      expect(output).toContain('Boolean');
      expect(output).toContain('f_int');
      expect(output).toContain('Int');
      expect(output).toContain('f_float');
      expect(output).toContain('Float');
      expect(output).toContain('f_time');
      expect(output).toContain('DateTime');
      expect(output).toContain('f_json');
      expect(output).toContain('Json');
    });
  });

  describe('generateSchema', () => {
    it('should generate schema for multiple resources', () => {
      const resources = [
        createResource({
          name: 'Category',
          fields: [{ name: 'name', displayName: 'Name', type: 'string', required: true }],
        }),
        createResource({
          name: 'Product',
          fields: [{ name: 'title', displayName: 'Title', type: 'string', required: true }],
        }),
      ];

      const output = generator.generateSchema(resources);

      expect(output).toContain('model Category {');
      expect(output).toContain('model Product {');
    });
  });
});
