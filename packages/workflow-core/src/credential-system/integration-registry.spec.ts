import { describe, it, expect, beforeEach } from 'vitest';
import { IntegrationRegistry } from './integration-registry';
import {
  apiKeyCredentialType,
  googleOAuth2CredentialType,
  builtInCredentialTypes,
} from './credential-types';

describe('IntegrationRegistry', () => {
  let registry: IntegrationRegistry;

  beforeEach(() => {
    registry = new IntegrationRegistry();
  });

  describe('register', () => {
    it('should register a credential type', () => {
      registry.register(apiKeyCredentialType);
      expect(registry.hasType('api-key')).toBe(true);
    });

    it('should reject duplicate registration', () => {
      registry.register(apiKeyCredentialType);
      expect(() => registry.register(apiKeyCredentialType)).toThrow(
        'already registered',
      );
    });
  });

  describe('get', () => {
    it('should return definition for registered type', () => {
      registry.register(apiKeyCredentialType);
      const def = registry.get('api-key');
      expect(def).toEqual(apiKeyCredentialType);
    });

    it('should return undefined for unknown type', () => {
      expect(registry.get('unknown')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered types', () => {
      registry.register(apiKeyCredentialType);
      registry.register(googleOAuth2CredentialType);
      expect(registry.getAll()).toHaveLength(2);
    });
  });

  describe('getByCategory', () => {
    it('should filter by category', () => {
      registry.register(apiKeyCredentialType); // category: 'api'
      registry.register(googleOAuth2CredentialType); // category: 'auth'
      expect(registry.getByCategory('api')).toHaveLength(1);
      expect(registry.getByCategory('auth')).toHaveLength(1);
      expect(registry.getByCategory('unknown')).toHaveLength(0);
    });
  });

  describe('validateCredential', () => {
    it('should validate valid credential data', () => {
      registry.register(apiKeyCredentialType);
      const result = registry.validateCredential('api-key', {
        apiKey: 'my-key',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid data', () => {
      registry.register(apiKeyCredentialType);
      const result = registry.validateCredential('api-key', {});
      expect(result.valid).toBe(false);
    });

    it('should reject unknown credential type', () => {
      const result = registry.validateCredential('unknown', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Unknown credential type');
    });
  });

  describe('getSecretFieldNames', () => {
    it('should return secret field names', () => {
      registry.register(apiKeyCredentialType);
      const fields = registry.getSecretFieldNames('api-key');
      expect(fields).toEqual(['apiKey']);
    });

    it('should return empty array for unknown type', () => {
      expect(registry.getSecretFieldNames('unknown')).toEqual([]);
    });
  });

  describe('getMetadataFieldNames', () => {
    it('should return metadata field names', () => {
      registry.register(apiKeyCredentialType);
      const fields = registry.getMetadataFieldNames('api-key');
      expect(fields).toEqual(['headerName']);
    });
  });

  describe('built-in types registration', () => {
    it('should register all built-in types', () => {
      for (const type of builtInCredentialTypes) {
        registry.register(type);
      }
      expect(registry.getAll()).toHaveLength(builtInCredentialTypes.length);
    });
  });
});
