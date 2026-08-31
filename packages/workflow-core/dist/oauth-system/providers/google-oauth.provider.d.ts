import {
  OAuthProvider,
  OAuthProviderMetadata,
  OAuthAuthorizationParams,
  OAuthAuthorizationUrl,
  OAuthTokenExchangeParams,
  OAuthTokenResult,
  OAuthRefreshParams,
} from '../oauth-provider.interface';
/**
 * Google OAuth 2.0 provider implementation.
 *
 * Supports:
 * - Authorization Code flow
 * - PKCE (S256)
 * - Refresh tokens
 *
 * Google endpoints:
 * - Authorization: https://accounts.google.com/o/oauth2/v2/auth
 * - Token: https://oauth2.googleapis.com/token
 * - Revocation: https://oauth2.googleapis.com/revoke
 * - UserInfo: https://www.googleapis.com/oauth2/v3/userinfo
 */
export declare class GoogleOAuthProvider implements OAuthProvider {
  readonly metadata: OAuthProviderMetadata;
  buildAuthorizationUrl(params: OAuthAuthorizationParams): OAuthAuthorizationUrl;
  validateState(state: string, expectedState: string): boolean;
  exchangeCode(params: OAuthTokenExchangeParams): Promise<OAuthTokenResult>;
  refreshToken(params: OAuthRefreshParams): Promise<OAuthTokenResult>;
  validateTokenResponse(response: unknown): response is OAuthTokenResult;
}
//# sourceMappingURL=google-oauth.provider.d.ts.map
