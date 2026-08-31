import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationGenerator } from './validation-generator';
import type { ResourceDefinition, ResourceField } from './resource-types';

describe('ValidationGenerator', () => {
  let generator: ValidationGenerator;

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
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      versionCount: 1,
    },
    ...overrides,
  });

  beforeEach(() => {
    generator = new ValidationGenerator();
  });

  describe('generateFieldDecorators', () => {
    it('should generate decorators for required string field', () => {
      const field: ResourceField = {
        name: 'title',
        displayName: 'Title',
        type: 'string',
        required: true,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsNotEmpty()');
      expect(decorators).toContain('@IsString()');
    });

    it('should generate decorators for optional string field', () => {
      const field: ResourceField = {
        name: 'subtitle',
        displayName: 'Subtitle',
        type: 'string',
        required: false,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsOptional()');
      expect(decorators).toContain('@IsString()');
    });

    it('should generate maxLength decorator', () => {
      const field: ResourceField = {
        name: 'name',
        displayName: 'Name',
        type: 'string',
        required: true,
        maxLength: 100,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@MaxLength(100)');
    });

    it('should generate minLength decorator', () => {
      const field: ResourceField = {
        name: 'code',
        displayName: 'Code',
        type: 'string',
        required: true,
        minLength: 3,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@MinLength(3)');
    });

    it('should generate pattern decorator', () => {
      const field: ResourceField = {
        name: 'slug',
        displayName: 'Slug',
        type: 'string',
        required: true,
        pattern: '^[a-z-]+$',
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators.some((d) => d.includes('@Matches'))).toBe(true);
    });

    it('should generate boolean decorators', () => {
      const field: ResourceField = {
        name: 'active',
        displayName: 'Active',
        type: 'boolean',
        required: true,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsBoolean()');
    });

    it('should generate integer decorators', () => {
      const field: ResourceField = {
        name: 'count',
        displayName: 'Count',
        type: 'integer',
        required: true,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsInt()');
    });

    it('should generate integer with min/max', () => {
      const field: ResourceField = {
        name: 'score',
        displayName: 'Score',
        type: 'integer',
        required: true,
        minimum: 0,
        maximum: 100,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@Min(0)');
      expect(decorators).toContain('@Max(100)');
    });

    it('should generate float decorators', () => {
      const field: ResourceField = {
        name: 'price',
        displayName: 'Price',
        type: 'float',
        required: true,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsNumber()');
    });

    it('should generate timestamp decorators', () => {
      const field: ResourceField = {
        name: 'publishedAt',
        displayName: 'Published At',
        type: 'timestamp',
        required: false,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsDateString()');
    });

    it('should generate json decorators', () => {
      const field: ResourceField = {
        name: 'metadata',
        displayName: 'Metadata',
        type: 'json',
        required: false,
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsObject()');
    });

    it('should generate enum decorators', () => {
      const field: ResourceField = {
        name: 'status',
        displayName: 'Status',
        type: 'enum',
        required: true,
        enum: ['active', 'inactive'],
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators.some((d) => d.includes('@IsIn'))).toBe(true);
    });

    it('should generate relation decorators', () => {
      const field: ResourceField = {
        name: 'user_id',
        displayName: 'User ID',
        type: 'relation',
        required: true,
        relationResource: 'User',
      };
      const decorators = generator.generateFieldDecorators(field);

      expect(decorators).toContain('@IsString()');
    });
  });

  describe('generateDto', () => {
    it('should generate a create DTO', () => {
      const resource = createResource();
      const output = generator.generateDto(resource, 'create');

      expect(output).toContain('export class CategoryCreateDto {');
      expect(output).toContain('name');
      expect(output).toContain('description');
      expect(output).toContain('@IsNotEmpty()');
      expect(output).toContain('@IsOptional()');
    });

    it('should generate an update DTO with all fields optional', () => {
      const resource = createResource();
      const output = generator.generateDto(resource, 'update');

      expect(output).toContain('export class CategoryUpdateDto {');
      // All fields should be optional in update
      expect(output).toContain('name?:');
      expect(output).toContain('description?:');
    });

    it('should generate a response DTO', () => {
      const resource = createResource();
      const output = generator.generateDto(resource, 'response');

      expect(output).toContain('export class CategoryResponse {');
      expect(output).toContain('id!: string');
      expect(output).toContain('projectId!: string');
      expect(output).toContain('createdAt!: Date');
      expect(output).toContain('updatedAt!: Date');
    });

    it('should include ApiProperty decorators', () => {
      const resource = createResource();
      const output = generator.generateDto(resource, 'create');

      expect(output).toContain('@ApiProperty');
      expect(output).toContain('@ApiPropertyOptional');
    });
  });
});
