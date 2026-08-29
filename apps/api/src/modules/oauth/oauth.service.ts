import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OAuthProviderRegistry,
  GoogleOAuthProvider,
  OAuthStateManager,
  OAuthTokenManager,
} from '@devflow/workflow-core';
import { CredentialsService } from '../credentials/credentials.service';

/**
 * OAuth service for orchestrating OAuth authorization flows.
 *
 * Handles:
 * - Authorization URL generation
 * - Callback processing (code exchange)
 * - Token storage via credentials system
 * - Token refresh
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly registry: OAuthProviderRegistry;
  private readonly stateManager: OAuthStateManager;
  private readonly tokenManagers = new Map<string, OAuthTokenManager>();

  constructor(
    private readonly configService: ConfigService,
    private readonly credentialsService: CredentialsService,
  ) {
    // Initialize provider registry
    this.registry = new OAuthProviderRegistry();
    this.registry.register(new GoogleOAuthProvider());

    // Initialize state manager
    const stateSecret =
      this.configService.get<string>('OAUTH_STATE_SECRET') ??
      this.configService.get<string>('ENCRYPTION_KEY', '');
    this.stateManager = new OAuthStateManager(stateSecret);
  }

  /**
   * Generate an authorization URL for the given provider.
   * Returns the URL and state token for CSRF protection.
   */
  async generateAuthorizationUrl(params: {
    providerType: string;
    projectId: string;
    clientId: string;
    clientSecret: string;
    scopes?: string[];
    redirectUri?: string;
    returnUrl?: string;
    credentialId?: string;
  }): Promise<{ authorizationUrl: string; state: string; codeVerifier?: string }> {
    const provider = this.registry.get(params.providerType);
    if (!provider) {
      throw new BadRequestException(`Unknown OAuth provider: ${params.providerType}`);
    }

    // Generate state token
    const state = this.stateManager.generateState({
      providerType: params.providerType,
      projectId: params.projectId,
      credentialId: params.credentialId,
      returnUrl: params.returnUrl,
    });

    // Build authorization URL
    const scopes = params.scopes ?? provider.metadata.defaultScopes;
    const redirectUri =
      params.redirectUri ??
      `${this.configService.get('API_BASE_URL', 'http://localhost:3000')}/api/v1/oauth/${params.providerType}/callback`;

    const result = provider.buildAuthorizationUrl({
      clientId: params.clientId,
      redirectUri,
      scope: scopes,
      state,
    });

    this.logger.log(
      `Generated authorization URL for ${params.providerType} (project: ${params.projectId})`,
    );

    return {
      authorizationUrl: result.url,
      state: result.state,
      codeVerifier: result.codeVerifier,
    };
  }

  /**
   * Handle an OAuth callback.
   * Validates state, exchanges code for tokens, stores credential.
   */
  async handleCallback(params: {
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
  }> {
    const provider = this.registry.get(params.providerType);
    if (!provider) {
      throw new BadRequestException(`Unknown OAuth provider: ${params.providerType}`);
    }

    // Validate state
    const stateData = this.stateManager.validateState(params.state);
    if (!stateData) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    // Verify provider matches
    if (stateData.providerType !== params.providerType) {
      throw new BadRequestException('State provider mismatch');
    }

    // Exchange code for tokens
    const redirectUri =
      params.redirectUri ??
      `${this.configService.get('API_BASE_URL', 'http://localhost:3000')}/api/v1/oauth/${params.providerType}/callback`;

    const tokenResult = await provider.exchangeCode({
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      code: params.code,
      redirectUri,
    });

    // Store credential
    const credentialData = {
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
    };

    const metadata: Record<string, unknown> = {
      provider: params.providerType,
      scope: tokenResult.scope,
    };

    if (tokenResult.expiresIn) {
      metadata.expiresAt = new Date(Date.now() + tokenResult.expiresIn * 1000).toISOString();
    }

    // Create or update credential
    let credentialId = stateData.credentialId;

    if (credentialId) {
      // Update existing credential
      await this.credentialsService.update(stateData.projectId, credentialId, {
        data: credentialData,
        metadata,
      });
    } else {
      // Create new credential
      const credential = await this.credentialsService.create(stateData.projectId, {
        name: `${provider.metadata.displayName} OAuth`,
        type: params.providerType,
        data: credentialData,
        metadata,
      });
      credentialId = credential.id;
    }

    this.logger.log(
      `OAuth callback handled for ${params.providerType} (credential: ${credentialId})`,
    );

    return {
      credentialId,
      returnUrl: stateData.returnUrl,
      scopes: tokenResult.scope,
    };
  }

  /**
   * Refresh an access token for a credential.
   */
  async refreshToken(params: {
    providerType: string;
    credentialId: string;
    projectId: string;
    clientId: string;
    clientSecret: string;
  }): Promise<{ accessToken: string }> {
    const provider = this.registry.get(params.providerType);
    if (!provider) {
      throw new BadRequestException(`Unknown OAuth provider: ${params.providerType}`);
    }

    // Get the token manager for this credential
    let tokenManager = this.tokenManagers.get(params.credentialId);
    if (!tokenManager) {
      tokenManager = new OAuthTokenManager(
        provider,
        async (id) => {
          const credential = await this.credentialsService.resolveCredential(params.projectId, id);
          return credential;
        },
        async (id, data, metadata) => {
          await this.credentialsService.update(params.projectId, id, {
            data: data as Record<string, unknown>,
            metadata: metadata as Record<string, unknown>,
          });
        },
      );
      this.tokenManagers.set(params.credentialId, tokenManager);
    }

    // Get current metadata
    const credential = await this.credentialsService.findOne(params.projectId, params.credentialId);

    const accessToken = await tokenManager.getValidAccessToken(
      params.credentialId,
      params.clientId,
      params.clientSecret,
      (credential.metadata as Record<string, unknown>) ?? {},
    );

    return { accessToken };
  }

  /**
   * Get available OAuth providers.
   */
  getProviders() {
    return this.registry.getAllMetadata();
  }

  /**
   * Get provider metadata.
   */
  getProviderMetadata(type: string) {
    return this.registry.getMetadata(type);
  }
}
