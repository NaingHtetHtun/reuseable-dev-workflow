import { describe, it, expect } from 'vitest';
import {
  validateCredentialData,
  builtInCredentialTypes,
  apiKeyCredentialType,
  googleOAuth2CredentialType,
} from './credential-types';

describe('Credential Types', () => {
  describe('validateCredentialData', () => {
    it('should accept valid data with all required fields', () => {
      const result = validateCredentialData(apiKeyCredentialType, {
        apiKey: 'my-api-key',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing required fields', () => {
      const result = validateCredentialData(apiKeyCredentialType, {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Missing required');
    });

    it('should accept optional fields as metadata', () => {
      const result = validateCredentialData(apiKeyCredentialType, {
        apiKey: 'key',
        headerName: 'X-API-Key',
      });
      expect(result.valid).toBe(true);
    });

    it('should validate Google OAuth2 with required fields only', () => {
      const result = validateCredentialData(googleOAuth2CredentialType, {
        clientId: 'client-id',
        clientSecret: 'client-secret',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject wrong field types', () => {
      const result = validateCredentialData(
        {
          ...apiKeyCredentialType,
          secretFields: [
            { name: 'apiKey', displayName: 'API Key', type: 'number', required: true },
          ],
        },
        { apiKey: 'not-a-number' },
      );
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('expected type');
    });
  });

  describe('built-in credential types', () => {
    it('should have 6 built-in types', () => {
      expect(builtInCredentialTypes).toHaveLength(6);
    });

    it('should have unique type identifiers', () => {
      const types = builtInCredentialTypes.map((t) => t.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(types.length);
    });

    it('should include api-key type', () => {
      expect(builtInCredentialTypes.some((t) => t.type === 'api-key')).toBe(true);
    });

    it('should include google-oauth2 type', () => {
      expect(
        builtInCredentialTypes.some((t) => t.type === 'google-oauth2'),
      ).toBe(true);
    });

    it('each type should have displayName and description', () => {
      for (const type of builtInCredentialTypes) {
        expect(type.displayName).toBeTruthy();
        expect(type.description).toBeTruthy();
        expect(type.category).toBeTruthy();
      }
    });
  });
});
