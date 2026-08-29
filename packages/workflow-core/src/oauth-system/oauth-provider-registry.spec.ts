import { describe, it, expect, beforeEach } from 'vitest';
import { OAuthProviderRegistry } from './oauth-provider-registry';
import { GoogleOAuthProvider } from './providers/google-oauth.provider';

describe('OAuthProviderRegistry', () => {
  let registry: OAuthProviderRegistry;

  beforeEach(() => {
    registry = new OAuthProviderRegistry();
  });

  describe('register', () => {
    it('should register a provider', () => {
      registry.register(new GoogleOAuthProvider());
      expect(registry.hasType('google-oauth2')).toBe(true);
    });

    it('should reject duplicate registration', () => {
      registry.register(new GoogleOAuthProvider());
      expect(() => registry.register(new GoogleOAuthProvider())).toThrow(
        'already registered',
      );
    });
  });

  describe('get', () => {
    it('should return provider for registered type', () => {
      const google = new GoogleOAuthProvider();
      registry.register(google);
      expect(registry.get('google-oauth2')).toBe(google);
    });

    it('should return undefined for unknown type', () => {
      expect(registry.get('unknown')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered providers', () => {
      registry.register(new GoogleOAuthProvider());
      expect(registry.getAll()).toHaveLength(1);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for registered provider', () => {
      registry.register(new GoogleOAuthProvider());
      const metadata = registry.getMetadata('google-oauth2');
      expect(metadata?.type).toBe('google-oauth2');
      expect(metadata?.supportsPkce).toBe(true);
    });

    it('should return undefined for unknown type', () => {
      expect(registry.getMetadata('unknown')).toBeUndefined();
    });
  });

  describe('getAllMetadata', () => {
    it('should return all provider metadata', () => {
      registry.register(new GoogleOAuthProvider());
      const all = registry.getAllMetadata();
      expect(all).toHaveLength(1);
      expect(all[0].type).toBe('google-oauth2');
    });
  });
});
