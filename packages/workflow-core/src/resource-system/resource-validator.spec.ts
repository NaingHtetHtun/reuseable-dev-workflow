import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceValidator } from './resource-validator';
import type { ResourceField } from './resource-types';

describe('ResourceValidator', () => {
  let validator: ResourceValidator;

  const createField = (overrides: Partial<ResourceField> = {}): ResourceField => ({
    name: 'title',
    displayName: 'Title',
    type: 'string',
    required: true,
    ...overrides,
  });

  beforeEach(() => {
    validator = new ResourceValidator();
  });

  describe('validateResource', () => {
    it('should validate a complete resource', () => {
      const result = validator.validateResource({
        name: 'Category',
        displayName: 'Category',
        version: '1.0.0',
        status: 'draft',
        fields: [createField()],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing name', () => {
      const result = validator.validateResource({
        displayName: 'Test',
        fields: [createField()],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should reject non-PascalCase name', () => {
      const result = validator.validateResource({
        name: 'category',
        displayName: 'Category',
        fields: [createField()],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('PascalCase'))).toBe(true);
    });

    it('should accept PascalCase names with numbers', () => {
      const result = validator.validateResource({
        name: 'BlogPost2',
        displayName: 'Blog Post 2',
        fields: [createField()],
      });

      expect(result.valid).toBe(true);
    });

    it('should reject missing displayName', () => {
      const result = validator.validateResource({
        name: 'Category',
        fields: [createField()],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Display name'))).toBe(true);
    });

    it('should reject invalid version format', () => {
      const result = validator.validateResource({
        name: 'Category',
        displayName: 'Category',
        version: 'v1',
        fields: [createField()],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('semver'))).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = validator.validateResource({
        name: 'Category',
        displayName: 'Category',
        status: 'invalid' as never,
        fields: [createField()],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('draft'))).toBe(true);
    });

    it('should reject empty fields array', () => {
      const result = validator.validateResource({
        name: 'Category',
        displayName: 'Category',
        fields: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('At least one field'))).toBe(true);
    });

    it('should reject non-array fields', () => {
      const result = validator.validateResource({
        name: 'Category',
        displayName: 'Category',
        fields: 'invalid' as unknown as ResourceField[],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('array'))).toBe(true);
    });

    it('should reject duplicate field names', () => {
      const result = validator.validateResource({
        name: 'Category',
        displayName: 'Category',
        fields: [createField({ name: 'title' }), createField({ name: 'title' })],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate field'))).toBe(true);
    });
  });

  describe('validateField', () => {
    it('should validate a valid field', () => {
      const result = validator.validateField(createField());
      expect(result.valid).toBe(true);
    });

    it('should reject missing field name', () => {
      const result = validator.validateField(createField({ name: '' }));
      expect(result.valid).toBe(false);
    });

    it('should reject non-snake_case field name', () => {
      const result = validator.validateField(createField({ name: 'Title' }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('snake_case'))).toBe(true);
    });

    it('should accept snake_case with numbers', () => {
      const result = validator.validateField(createField({ name: 'created_at_2' }));
      expect(result.valid).toBe(true);
    });

    it('should reject missing displayName', () => {
      const result = validator.validateField(createField({ displayName: '' }));
      expect(result.valid).toBe(false);
    });

    it('should reject invalid field type', () => {
      const result = validator.validateField(createField({ type: 'invalid' as never }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('invalid type'))).toBe(true);
    });
  });

  describe('validateFieldConstraints', () => {
    it('should validate enum field with values', () => {
      const result = validator.validateField(
        createField({ type: 'enum', enum: ['active', 'inactive'] }),
      );
      expect(result.valid).toBe(true);
    });

    it('should reject enum field without values', () => {
      const result = validator.validateField(createField({ type: 'enum' }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('enum value'))).toBe(true);
    });

    it('should validate relation field with target', () => {
      const result = validator.validateField(
        createField({
          type: 'relation',
          relationResource: 'User',
          relationType: 'one-to-many',
        }),
      );
      expect(result.valid).toBe(true);
    });

    it('should reject relation field without target', () => {
      const result = validator.validateField(createField({ type: 'relation' }));
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('relationResource'))).toBe(true);
    });

    it('should reject invalid relation type', () => {
      const result = validator.validateField(
        createField({
          type: 'relation',
          relationResource: 'User',
          relationType: 'invalid' as never,
        }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('relationType'))).toBe(true);
    });

    it('should reject minLength > maxLength', () => {
      const result = validator.validateField(
        createField({ type: 'string', minLength: 10, maxLength: 5 }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('minLength'))).toBe(true);
    });

    it('should reject minimum > maximum', () => {
      const result = validator.validateField(
        createField({ type: 'integer', minimum: 100, maximum: 10 }),
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('minimum'))).toBe(true);
    });
  });

  describe('isValidVersion', () => {
    it('should accept valid semver', () => {
      expect(validator.isValidVersion('1.0.0')).toBe(true);
      expect(validator.isValidVersion('0.1.0')).toBe(true);
      expect(validator.isValidVersion('10.20.30')).toBe(true);
    });

    it('should reject invalid semver', () => {
      expect(validator.isValidVersion('v1.0.0')).toBe(false);
      expect(validator.isValidVersion('1.0')).toBe(false);
      expect(validator.isValidVersion('1')).toBe(false);
    });
  });

  describe('incrementVersion', () => {
    it('should increment patch version', () => {
      expect(validator.incrementVersion('1.0.0', 'patch')).toBe('1.0.1');
      expect(validator.incrementVersion('1.2.3', 'patch')).toBe('1.2.4');
    });

    it('should increment minor version', () => {
      expect(validator.incrementVersion('1.0.0', 'minor')).toBe('1.1.0');
      expect(validator.incrementVersion('1.2.3', 'minor')).toBe('1.3.0');
    });

    it('should increment major version', () => {
      expect(validator.incrementVersion('1.0.0', 'major')).toBe('2.0.0');
      expect(validator.incrementVersion('1.2.3', 'major')).toBe('2.0.0');
    });
  });

  describe('toTableName', () => {
    it('should convert PascalCase to snake_case', () => {
      expect(validator.toTableName('Category')).toBe('category');
      expect(validator.toTableName('BlogPost')).toBe('blog_post');
      expect(validator.toTableName('User')).toBe('user');
      expect(validator.toTableName('OAuthToken')).toBe('o_auth_token');
    });
  });
});
