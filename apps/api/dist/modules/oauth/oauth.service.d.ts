import { ConfigService } from '@nestjs/config';
import { CredentialsService } from '../credentials/credentials.service';
export declare class OAuthService {
    private readonly configService;
    private readonly credentialsService;
    private readonly logger;
    private readonly registry;
    private readonly stateManager;
    private readonly tokenManagers;
    constructor(configService: ConfigService, credentialsService: CredentialsService);
    generateAuthorizationUrl(params: {
        providerType: string;
        projectId: string;
        clientId: string;
        clientSecret: string;
        scopes?: string[];
        redirectUri?: string;
        returnUrl?: string;
        credentialId?: string;
    }): Promise<{
        authorizationUrl: string;
        state: string;
        codeVerifier?: string;
    }>;
    handleCallback(params: {
        providerType: string;
        code: string;
        state: string;
        clientId: string;
        clientSecret: string;
        redirectUri?: string;
    }): Promise<{
        credentialId: string;
        returnUrl?: string;
        scopes?: string;
    }>;
    refreshToken(params: {
        providerType: string;
        credentialId: string;
        projectId: string;
        clientId: string;
        clientSecret: string;
    }): Promise<{
        accessToken: string;
    }>;
    getProviders(): import("@devflow/workflow-core").OAuthProviderMetadata[];
    getProviderMetadata(type: string): import("@devflow/workflow-core").OAuthProviderMetadata | undefined;
}
