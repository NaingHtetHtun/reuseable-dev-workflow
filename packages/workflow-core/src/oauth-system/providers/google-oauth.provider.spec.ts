import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleOAuthProvider } from './google-oauth.provider';
import { PkceHelper } from '../pkce-helper';
import { OAuthError } from '../oauth-provider.interface';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('GoogleOAuthProvider', () => {
  let provider: GoogleOAuthProvider;

  beforeEach(() => {
    provider = new GoogleOAuthProvider();
    mockFetch.mockReset();
  });

  describe('metadata', () => {
    it('should have correct provider type', () => {
      expect(provider.metadata.type).toBe('google-oauth2');
    });

    it('should support PKCE', () => {
      expect(provider.metadata.supportsPkce).toBe(true);
    });

    it('should have correct endpoints', () => {
      expect(provider.metadata.authorizationEndpoint).toContain('accounts.google.com');
      expect(provider.metadata.tokenEndpoint).toContain('googleapis.com');
    });
  });

  describe('buildAuthorizationUrl', () => {
    it('should build a valid authorization URL', () => {
      const result = provider.buildAuthorizationUrl({
        clientId: 'client-123',
        redirectUri: 'https://example.com/callback',
        scope: ['email', 'profile'],
        state: 'test-state',
      });

      const url = new URL(result.url);
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('client_id')).toBe('client-123');
      expect(url.searchParams.get('redirect_uri')).toBe('https://example.com/callback');
      expect(url.searchParams.get('scope')).toBe('email profile');
      expect(url.searchParams.get('state')).toBe('test-state');
      expect(url.searchParams.get('access_type')).toBe('offline');
    });

    it('should include PKCE parameters', () => {
      const result = provider.buildAuthorizationUrl({
        clientId: 'client-123',
        redirectUri: 'https://example.com/callback',
        scope: ['email'],
        state: 'test-state',
      });

      const url = new URL(result.url);
      expect(url.searchParams.has('code_challenge')).toBe(true);
      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
      expect(result.codeVerifier).toBeTruthy();
    });

    it('should use provided code challenge', () => {
      const challenge = PkceHelper.generate();
      const result = provider.buildAuthorizationUrl({
        clientId: 'client-123',
        redirectUri: 'https://example.com/callback',
        scope: ['email'],
        state: 'test-state',
        codeChallenge: challenge.codeChallenge,
      });

      const url = new URL(result.url);
      expect(url.searchParams.get('code_challenge')).toBe(challenge.codeChallenge);
    });

    it('should include extra params', () => {
      const result = provider.buildAuthorizationUrl({
        clientId: 'client-123',
        redirectUri: 'https://example.com/callback',
        scope: ['email'],
        state: 'test-state',
        extraParams: { login_hint: 'user@example.com' },
      });

      const url = new URL(result.url);
      expect(url.searchParams.get('login_hint')).toBe('user@example.com');
    });

    it('should return state in result', () => {
      const result = provider.buildAuthorizationUrl({
        clientId: 'client-123',
        redirectUri: 'https://example.com/callback',
        scope: ['email'],
        state: 'my-state',
      });

      expect(result.state).toBe('my-state');
    });
  });

  describe('validateState', () => {
    it('should accept matching state', () => {
      expect(provider.validateState('abc123', 'abc123')).toBe(true);
    });

    it('should reject mismatched state', () => {
      expect(provider.validateState('abc123', 'xyz789')).toBe(false);
    });

    it('should reject different length state', () => {
      expect(provider.validateState('abc', 'abcdef')).toBe(false);
    });
  });

  describe('exchangeCode', () => {
    it('should exchange code for tokens', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'access-123',
          refresh_token: 'refresh-456',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'email profile',
        }),
      });

      const result = await provider.exchangeCode({
        clientId: 'client-123',
        clientSecret: 'secret-456',
        code: 'auth-code',
        redirectUri: 'https://example.com/callback',
      });

      expect(result.accessToken).toBe('access-123');
      expect(result.refreshToken).toBe('refresh-456');
      expect(result.expiresIn).toBe(3600);

      // Verify request
      const body = mockFetch.mock.calls[0][1].body;
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('code=auth-code');
    });

    it('should include code_verifier for PKCE', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'access-123',
          expires_in: 3600,
        }),
      });

      await provider.exchangeCode({
        clientId: 'client-123',
        clientSecret: 'secret-456',
        code: 'auth-code',
        redirectUri: 'https://example.com/callback',
        codeVerifier: 'my-code-verifier',
      });

      const body = mockFetch.mock.calls[0][1].body;
      expect(body).toContain('code_verifier=my-code-verifier');
    });

    it('should throw OAuthError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Code expired',
        }),
      });

      await expect(
        provider.exchangeCode({
          clientId: 'client-123',
          clientSecret: 'secret-456',
          code: 'expired-code',
          redirectUri: 'https://example.com/callback',
        }),
      ).rejects.toThrow(OAuthError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-123',
          expires_in: 3600,
        }),
      });

      const result = await provider.refreshToken({
        clientId: 'client-123',
        clientSecret: 'secret-456',
        refreshToken: 'refresh-456',
      });

      expect(result.accessToken).toBe('new-access-123');
      // Should keep original refresh token when not returned
      expect(result.refreshToken).toBe('refresh-456');

      const body = mockFetch.mock.calls[0][1].body;
      expect(body).toContain('grant_type=refresh_token');
      expect(body).toContain('refresh_token=refresh-456');
    });

    it('should use new refresh token if returned', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-123',
          refresh_token: 'new-refresh-789',
          expires_in: 3600,
        }),
      });

      const result = await provider.refreshToken({
        clientId: 'client-123',
        clientSecret: 'secret-456',
        refreshToken: 'old-refresh',
      });

      expect(result.refreshToken).toBe('new-refresh-789');
    });

    it('should throw OAuthError on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Refresh token expired',
        }),
      });

      await expect(
        provider.refreshToken({
          clientId: 'client-123',
          clientSecret: 'secret-456',
          refreshToken: 'expired-refresh',
        }),
      ).rejects.toThrow(OAuthError);
    });
  });

  describe('validateTokenResponse', () => {
    it('should accept valid response', () => {
      expect(
        provider.validateTokenResponse({ accessToken: 'token' }),
      ).toBe(true);
    });

    it('should reject response without accessToken', () => {
      expect(provider.validateTokenResponse({})).toBe(false);
      expect(provider.validateTokenResponse(null)).toBe(false);
      expect(provider.validateTokenResponse('string')).toBe(false);
    });
  });
});
