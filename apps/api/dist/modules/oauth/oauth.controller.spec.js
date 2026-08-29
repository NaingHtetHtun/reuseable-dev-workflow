"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const oauth_controller_1 = require("./oauth.controller");
const oauth_service_1 = require("./oauth.service");
describe('OAuthController', () => {
    let controller;
    let service;
    beforeEach(async () => {
        service = {
            generateAuthorizationUrl: jest.fn(),
            handleCallback: jest.fn(),
            refreshToken: jest.fn(),
            getProviders: jest.fn(),
            getProviderMetadata: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            controllers: [oauth_controller_1.OAuthController],
            providers: [{ provide: oauth_service_1.OAuthService, useValue: service }],
        }).compile();
        controller = module.get(oauth_controller_1.OAuthController);
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
                    supportedFlows: ['authorization-code'],
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
//# sourceMappingURL=oauth.controller.spec.js.map