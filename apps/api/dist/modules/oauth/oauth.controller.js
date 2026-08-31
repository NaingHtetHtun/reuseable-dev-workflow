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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.OAuthController = void 0;
const common_1 = require('@nestjs/common');
const oauth_service_1 = require('./oauth.service');
const dto_1 = require('./dto');
let OAuthController = class OAuthController {
  oauthService;
  constructor(oauthService) {
    this.oauthService = oauthService;
  }
  getProviders() {
    return this.oauthService.getProviders();
  }
  async authorize(provider, dto) {
    const result = await this.oauthService.generateAuthorizationUrl({
      providerType: provider,
      projectId: dto.projectId,
      clientId: '',
      clientSecret: '',
      scopes: dto.scopes,
      redirectUri: dto.redirectUri,
      returnUrl: dto.returnUrl,
      credentialId: dto.credentialId,
    });
    return {
      authorizationUrl: result.authorizationUrl,
      state: result.state,
      codeVerifier: result.codeVerifier,
    };
  }
  async authorizeRedirect(
    provider,
    projectId,
    clientId,
    clientSecret,
    scopes,
    redirectUri,
    returnUrl,
    res,
  ) {
    if (!projectId || !clientId || !clientSecret) {
      throw new common_1.BadRequestException('projectId, clientId, and clientSecret are required');
    }
    const result = await this.oauthService.generateAuthorizationUrl({
      providerType: provider,
      projectId,
      clientId,
      clientSecret,
      scopes: scopes ? scopes.split(',') : undefined,
      redirectUri,
      returnUrl,
    });
    res.redirect(result.authorizationUrl);
  }
  async handleCallback(provider, query, res) {
    if (query.error) {
      const errorUrl = query.error_description
        ? `${query.error}?error_description=${encodeURIComponent(query.error_description)}`
        : query.error;
      throw new common_1.BadRequestException(`OAuth error: ${errorUrl}`);
    }
    const result = await this.oauthService.handleCallback({
      providerType: provider,
      code: query.code,
      state: query.state,
      clientId: '',
      clientSecret: '',
    });
    if (result.returnUrl) {
      const separator = result.returnUrl.includes('?') ? '&' : '?';
      res.redirect(
        `${result.returnUrl}${separator}credentialId=${result.credentialId}&success=true`,
      );
    } else {
      res.json({
        success: true,
        credentialId: result.credentialId,
        scopes: result.scopes,
      });
    }
  }
  async refreshToken(provider, body) {
    return this.oauthService.refreshToken({
      providerType: provider,
      credentialId: body.credentialId,
      projectId: body.projectId,
      clientId: body.clientId,
      clientSecret: body.clientSecret,
    });
  }
};
exports.OAuthController = OAuthController;
__decorate(
  [
    (0, common_1.Get)('providers'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', void 0),
  ],
  OAuthController.prototype,
  'getProviders',
  null,
);
__decorate(
  [
    (0, common_1.Post)(':provider/authorize'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, dto_1.AuthorizeDto]),
    __metadata('design:returntype', Promise),
  ],
  OAuthController.prototype,
  'authorize',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':provider/authorize'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('clientId')),
    __param(3, (0, common_1.Query)('clientSecret')),
    __param(4, (0, common_1.Query)('scopes')),
    __param(5, (0, common_1.Query)('redirectUri')),
    __param(6, (0, common_1.Query)('returnUrl')),
    __param(7, (0, common_1.Res)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [
      String,
      String,
      String,
      String,
      String,
      String,
      String,
      Object,
    ]),
    __metadata('design:returntype', Promise),
  ],
  OAuthController.prototype,
  'authorizeRedirect',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':provider/callback'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, dto_1.CallbackQueryDto, Object]),
    __metadata('design:returntype', Promise),
  ],
  OAuthController.prototype,
  'handleCallback',
  null,
);
__decorate(
  [
    (0, common_1.Post)(':provider/refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Object]),
    __metadata('design:returntype', Promise),
  ],
  OAuthController.prototype,
  'refreshToken',
  null,
);
exports.OAuthController = OAuthController = __decorate(
  [
    (0, common_1.Controller)('oauth'),
    __metadata('design:paramtypes', [oauth_service_1.OAuthService]),
  ],
  OAuthController,
);
//# sourceMappingURL=oauth.controller.js.map
