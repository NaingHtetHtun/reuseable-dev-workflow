import { Response } from 'express';
import { OAuthService } from './oauth.service';
import { AuthorizeDto, CallbackQueryDto } from './dto';
export declare class OAuthController {
  private readonly oauthService;
  constructor(oauthService: OAuthService);
  getProviders(): import('@devflow/workflow-core').OAuthProviderMetadata[];
  authorize(
    provider: string,
    dto: AuthorizeDto,
  ): Promise<{
    authorizationUrl: string;
    state: string;
    codeVerifier: string | undefined;
  }>;
  authorizeRedirect(
    provider: string,
    projectId: string,
    clientId: string,
    clientSecret: string,
    scopes: string,
    redirectUri: string,
    returnUrl: string,
    res: Response,
  ): Promise<void>;
  handleCallback(provider: string, query: CallbackQueryDto, res: Response): Promise<void>;
  refreshToken(
    provider: string,
    body: {
      credentialId: string;
      projectId: string;
      clientId: string;
      clientSecret: string;
    },
  ): Promise<{
    accessToken: string;
  }>;
}
