import { Test, TestingModule } from '@nestjs/testing';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';

describe('OAuthController', () => {
  let controller: OAuthController;
  let service: jest.Mocked<OAuthService>;

  beforeEach(async () => {
    service = {
      generateAuthorizationUrl: jest.fn(),
      handleCallback: jest.fn(),
      refreshToken: jest.fn(),
      getProviders: jest.fn(),
      getProviderMetadata: jest.fn(),
    } as unknown as jest.Mocked<OAuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
      providers: [{ provide: OAuthService, useValue: service }],
    }).compile();

    controller = module.get<OAuthController>(OAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProviders', () => {
    it('should return providers', () => {
      service.getProviders.mockReturnValue([
        {
          type: 'google-oauth2',
          displayName: 'Google OAuth2',
          description: 'Google OAuth2 authentication',
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
          supportedFlows: ['authorization-code'] as const,
          supportsPkce: true,
          defaultScopes: ['email', 'profile'],
        },
      ]);

      const result = controller.getProviders();
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('google-oauth2');
    });
  });

  describe('authorize (POST)', () => {
    it('should return authorization URL', async () => {
      service.generateAuthorizationUrl.mockResolvedValue({
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?...',
        state: 'test-state',
        codeVerifier: 'test-verifier',
      });

      const result = await controller.authorize('google-oauth2', {
        projectId: 'proj-1',
        scopes: ['email'],
      });

      expect(result.authorizationUrl).toContain('accounts.google.com');
      expect(result.state).toBe('test-state');
      expect(result.codeVerifier).toBe('test-verifier');
    });
  });
});
