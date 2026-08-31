import { OAuthProvider } from './oauth-provider.interface';
import { Logger } from '../logger.interface';
/**
 * OAuth token manager for automatic token refresh.
 *
 * Checks token expiry and refreshes when needed.
 */
export declare class OAuthTokenManager {
  private readonly provider;
  private readonly credentialResolver;
  private readonly credentialUpdater;
  private readonly logger;
  constructor(
    provider: OAuthProvider,
    credentialResolver: (id: string) => Promise<Record<string, unknown>>,
    credentialUpdater: (
      id: string,
      data: Record<string, unknown>,
      metadata: Record<string, unknown>,
    ) => Promise<void>,
    logger?: Logger,
  );
  /**
   * Get a valid access token, refreshing if necessary.
   *
   * @param credentialId - The credential ID containing OAuth tokens
   * @param clientId - The OAuth client ID
   * @param clientSecret - The OAuth client secret
   * @param credentialMetadata - The credential metadata (contains expiresAt)
   * @returns A valid access token
   */
  getValidAccessToken(
    credentialId: string,
    clientId: string,
    clientSecret: string,
    credentialMetadata: Record<string, unknown>,
  ): Promise<string>;
  /**
   * Check if a token is expired or about to expire.
   */
  private isTokenExpired;
}
//# sourceMappingURL=token-manager.d.ts.map
