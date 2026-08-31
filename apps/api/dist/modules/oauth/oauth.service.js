'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var OAuthService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.OAuthService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const workflow_core_1 = require('@devflow/workflow-core');
const credentials_service_1 = require('../credentials/credentials.service');
let OAuthService = (OAuthService_1 = class OAuthService {
  configService;
  credentialsService;
  logger = new common_1.Logger(OAuthService_1.name);
  registry;
  stateManager;
  tokenManagers = new Map();
  constructor(configService, credentialsService) {
    this.configService = configService;
    this.credentialsService = credentialsService;
    this.registry = new workflow_core_1.OAuthProviderRegistry();
    this.registry.register(new workflow_core_1.GoogleOAuthProvider());
    const stateSecret =
      this.configService.get('OAUTH_STATE_SECRET') ?? this.configService.get('ENCRYPTION_KEY', '');
    this.stateManager = new workflow_core_1.OAuthStateManager(stateSecret);
  }
  async generateAuthorizationUrl(params) {
    const provider = this.registry.get(params.providerType);
    if (!provider) {
      throw new common_1.BadRequestException(`Unknown OAuth provider: ${params.providerType}`);
    }
    const state = this.stateManager.generateState({
      providerType: params.providerType,
      projectId: params.projectId,
      credentialId: params.credentialId,
      returnUrl: params.returnUrl,
    });
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
  async handleCallback(params) {
    const provider = this.registry.get(params.providerType);
    if (!provider) {
      throw new common_1.BadRequestException(`Unknown OAuth provider: ${params.providerType}`);
    }
    const stateData = this.stateManager.validateState(params.state);
    if (!stateData) {
      throw new common_1.BadRequestException('Invalid or expired state parameter');
    }
    if (stateData.providerType !== params.providerType) {
      throw new common_1.BadRequestException('State provider mismatch');
    }
    const redirectUri =
      params.redirectUri ??
      `${this.configService.get('API_BASE_URL', 'http://localhost:3000')}/api/v1/oauth/${params.providerType}/callback`;
    const tokenResult = await provider.exchangeCode({
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      code: params.code,
      redirectUri,
    });
    const credentialData = {
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
    };
    const metadata = {
      provider: params.providerType,
      scope: tokenResult.scope,
    };
    if (tokenResult.expiresIn) {
      metadata.expiresAt = new Date(Date.now() + tokenResult.expiresIn * 1000).toISOString();
    }
    let credentialId = stateData.credentialId;
    if (credentialId) {
      await this.credentialsService.update(stateData.projectId, credentialId, {
        data: credentialData,
        metadata,
      });
    } else {
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
  async refreshToken(params) {
    const provider = this.registry.get(params.providerType);
    if (!provider) {
      throw new common_1.BadRequestException(`Unknown OAuth provider: ${params.providerType}`);
    }
    let tokenManager = this.tokenManagers.get(params.credentialId);
    if (!tokenManager) {
      tokenManager = new workflow_core_1.OAuthTokenManager(
        provider,
        async (id) => {
          const credential = await this.credentialsService.resolveCredential(params.projectId, id);
          return credential;
        },
        async (id, data, metadata) => {
          await this.credentialsService.update(params.projectId, id, {
            data: data,
            metadata: metadata,
          });
        },
      );
      this.tokenManagers.set(params.credentialId, tokenManager);
    }
    const credential = await this.credentialsService.findOne(params.projectId, params.credentialId);
    const accessToken = await tokenManager.getValidAccessToken(
      params.credentialId,
      params.clientId,
      params.clientSecret,
      credential.metadata ?? {},
    );
    return { accessToken };
  }
  getProviders() {
    return this.registry.getAllMetadata();
  }
  getProviderMetadata(type) {
    return this.registry.getMetadata(type);
  }
});
exports.OAuthService = OAuthService;
exports.OAuthService =
  OAuthService =
  OAuthService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [
          config_1.ConfigService,
          credentials_service_1.CredentialsService,
        ]),
      ],
      OAuthService,
    );
//# sourceMappingURL=oauth.service.js.map
