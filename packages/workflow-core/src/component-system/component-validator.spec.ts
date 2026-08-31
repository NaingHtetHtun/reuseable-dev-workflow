import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentValidator } from './component-validator';
import type {
  ComponentConfigSchema,
  ComponentCredentialSchema,
  ComponentIoSchema,
} from './component-types';

describe('ComponentValidator', () => {
  let validator: ComponentValidator;

  beforeEach(() => {
    validator = new ComponentValidator();
  });

  describe('validateComponent', () => {
    it('should validate a complete component', () => {
      const result = validator.validateComponent({
        name: 'test-component',
        displayName: 'Test Component',
        version: '1.0.0',
        status: 'draft',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing name', () => {
      const result = validator.validateComponent({
        displayName: 'Test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Name'))).toBe(true);
    });

    it('should reject invalid name format', () => {
      const result = validator.validateComponent({
        name: 'Invalid Name!',
        displayName: 'Test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('lowercase'))).toBe(true);
    });

    it('should reject missing displayName', () => {
      const result = validator.validateComponent({
        name: 'test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Display name'))).toBe(true);
    });

    it('should reject invalid version format', () => {
      const result = validator.validateComponent({
        name: 'test',
        displayName: 'Test',
        version: 'v1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('semver'))).toBe(true);
    });

    it('should accept valid semver versions', () => {
      expect(validator.isValidVersion('1.0.0')).toBe(true);
      expect(validator.isValidVersion('0.1.0')).toBe(true);
      expect(validator.isValidVersion('10.20.30')).toBe(true);
    });

    it('should reject invalid semver versions', () => {
      expect(validator.isValidVersion('v1.0.0')).toBe(false);
      expect(validator.isValidVersion('1.0')).toBe(false);
      expect(validator.isValidVersion('1')).toBe(false);
    });
  });

  describe('validateConfigSchema', () => {
    it('should validate a valid config schema', () => {
      const schema: ComponentConfigSchema = {
        type: 'object',
        properties: {
          apiKey: {
            type: 'string',
            displayName: 'API Key',
            description: 'Your API key',
          },
        },
        required: ['apiKey'],
      };

      const result = validator.validateConfigSchema(schema);
      expect(result.valid).toBe(true);
    });

    it('should reject non-object type', () => {
      const schema = {
        type: 'string',
        properties: {},
      } as unknown as ComponentConfigSchema;

      const result = validator.validateConfigSchema(schema);
      expect(result.valid).toBe(false);
    });

    it('should reject missing properties', () => {
      const schema = {
        type: 'object',
      } as unknown as ComponentConfigSchema;

      const result = validator.validateConfigSchema(schema);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCredentialSchema', () => {
    it('should validate a valid credential schema', () => {
      const schema: ComponentCredentialSchema = {
        required: [
          {
            type: 'google-oauth2',
            displayName: 'Google OAuth2',
            description: 'Google credentials for login',
          },
        ],
      };

      const result = validator.validateCredentialSchema(schema);
      expect(result.valid).toBe(true);
    });

    it('should reject missing required array', () => {
      const schema = {} as unknown as ComponentCredentialSchema;

      const result = validator.validateCredentialSchema(schema);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateIoSchema', () => {
    it('should validate a valid IO schema', () => {
      const schema: ComponentIoSchema = {
        type: 'object',
        properties: {
          email: { type: 'string', displayName: 'Email' },
        },
      };

      const result = validator.validateIoSchema(schema, 'input');
      expect(result.valid).toBe(true);
    });

    it('should reject non-object type', () => {
      const schema = {
        type: 'string',
        properties: {},
      } as unknown as ComponentIoSchema;

      const result = validator.validateIoSchema(schema, 'output');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateImplementation', () => {
    it('should validate a workflow implementation', () => {
      const result = validator.validateImplementation({
        type: 'workflow',
        workflow: { nodes: [], edges: [] },
      });

      expect(result.valid).toBe(true);
    });

    it('should validate a node implementation', () => {
      const result = validator.validateImplementation({
        type: 'node',
        node: { type: 'log', parameters: {} },
      });

      expect(result.valid).toBe(true);
    });

    it('should reject missing implementation type', () => {
      const result = validator.validateImplementation({
        type: '' as unknown as 'workflow' | 'node' | 'function',
      });

      expect(result.valid).toBe(false);
    });

    it('should reject workflow without workflow definition', () => {
      const result = validator.validateImplementation({
        type: 'workflow',
      });

      expect(result.valid).toBe(false);
    });

    it('should reject node without node definition', () => {
      const result = validator.validateImplementation({
        type: 'node',
      });

      expect(result.valid).toBe(false);
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
});
