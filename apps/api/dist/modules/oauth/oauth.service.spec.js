"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const oauth_service_1 = require("./oauth.service");
const credentials_service_1 = require("../credentials/credentials.service");
const crypto = __importStar(require("crypto"));
const TEST_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
describe('OAuthService', () => {
    let service;
    const mockCredentialsService = {
        create: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        resolveCredential: jest.fn(),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const configService = {
            get: jest.fn((key, defaultValue) => {
                if (key === 'ENCRYPTION_KEY')
                    return TEST_ENCRYPTION_KEY;
                if (key === 'OAUTH_STATE_SECRET')
                    return TEST_ENCRYPTION_KEY;
                if (key === 'API_BASE_URL')
                    return 'http://localhost:3000';
                return defaultValue;
            }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                oauth_service_1.OAuthService,
                { provide: config_1.ConfigService, useValue: configService },
                { provide: credentials_service_1.CredentialsService, useValue: mockCredentialsService },
            ],
        }).compile();
        service = module.get(oauth_service_1.OAuthService);
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
            await expect(service.generateAuthorizationUrl({
                providerType: 'unknown',
                projectId: 'proj-1',
                clientId: 'client-123',
                clientSecret: 'secret-456',
            })).rejects.toThrow('Unknown OAuth provider');
        });
    });
    describe('handleCallback', () => {
        it('should handle callback with valid state', async () => {
            const authResult = await service.generateAuthorizationUrl({
                providerType: 'google-oauth2',
                projectId: 'proj-1',
                clientId: 'client-123',
                clientSecret: 'secret-456',
            });
            mockCredentialsService.create.mockResolvedValue({
                id: 'cred-123',
                name: 'Google OAuth',
                type: 'google-oauth2',
            });
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
            await expect(service.handleCallback({
                providerType: 'google-oauth2',
                code: 'auth-code',
                state: 'invalid-state',
                clientId: 'client-123',
                clientSecret: 'secret-456',
            })).rejects.toThrow('Invalid or expired state');
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
//# sourceMappingURL=oauth.service.spec.js.map