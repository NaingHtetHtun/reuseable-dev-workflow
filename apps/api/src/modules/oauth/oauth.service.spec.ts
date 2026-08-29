import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuthService } from './oauth.service';
import { CredentialsService } from '../credentials/credentials.service';
import * as crypto from 'crypto';

const TEST_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

describe('OAuthService', () => {
  let service: OAuthService;

  const mockCredentialsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    resolveCredential: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'ENCRYPTION_KEY') return TEST_ENCRYPTION_KEY;
        if (key === 'OAUTH_STATE_SECRET') return TEST_ENCRYPTION_KEY;
        if (key === 'API_BASE_URL') return 'http://localhost:3000';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        { provide: ConfigService, useValue: configService },
        { provide: CredentialsService, useValue: mockCredentialsService },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAuthorizationUrl', () => {
    it('should generate a valid authorization URL for Google', async () => {
      const result = await service.generateAuthorizationUrl({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
        clientId: 'client-123',
        clientSecret: 'secret-456',
        scopes: ['email', 'profile'],
      });

      expect(result.authorizationUrl).toContain('accounts.google.com');
      expect(result.authorizationUrl).toContain('client_id=client-123');
      expect(result.authorizationUrl).toContain('scope=email+profile');
      expect(result.state).toBeTruthy();
      expect(result.codeVerifier).toBeTruthy();
    });

    it('should throw for unknown provider', async () => {
      await expect(
        service.generateAuthorizationUrl({
          providerType: 'unknown',
          projectId: 'proj-1',
          clientId: 'client-123',
          clientSecret: 'secret-456',
        }),
      ).rejects.toThrow('Unknown OAuth provider');
    });
  });

  describe('handleCallback', () => {
    it('should handle callback with valid state', async () => {
      // First generate a valid state
      const authResult = await service.generateAuthorizationUrl({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
        clientId: 'client-123',
        clientSecret: 'secret-456',
      });

      // Mock credential creation
      mockCredentialsService.create.mockResolvedValue({
        id: 'cred-123',
        name: 'Google OAuth',
        type: 'google-oauth2',
      });

      // Mock fetch for token exchange
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'access-123',
          refresh_token: 'refresh-456',
          expires_in: 3600,
        }),
      });

      const result = await service.handleCallback({
        providerType: 'google-oauth2',
        code: 'auth-code',
        state: authResult.state,
        clientId: 'client-123',
        clientSecret: 'secret-456',
      });

      expect(result.credentialId).toBe('cred-123');
      expect(mockCredentialsService.create).toHaveBeenCalled();
    });

    it('should reject invalid state', async () => {
      await expect(
        service.handleCallback({
          providerType: 'google-oauth2',
          code: 'auth-code',
          state: 'invalid-state',
          clientId: 'client-123',
          clientSecret: 'secret-456',
        }),
      ).rejects.toThrow('Invalid or expired state');
    });
  });

  describe('getProviders', () => {
    it('should return available providers', () => {
      const providers = service.getProviders();
      expect(providers.length).toBeGreaterThan(0);
      expect(providers.some((p) => p.type === 'google-oauth2')).toBe(true);
    });
  });
});
