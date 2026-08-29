import { noopLogger } from '../logger.interface';
/**
 * OAuth token manager for automatic token refresh.
 *
 * Checks token expiry and refreshes when needed.
 */
export class OAuthTokenManager {
    provider;
    credentialResolver;
    credentialUpdater;
    logger;
    constructor(provider, credentialResolver, credentialUpdater, logger) {
        this.provider = provider;
        this.credentialResolver = credentialResolver;
        this.credentialUpdater = credentialUpdater;
        this.logger = logger ?? noopLogger;
    }
    /**
     * Get a valid access token, refreshing if necessary.
     *
     * @param credentialId - The credential ID containing OAuth tokens
     * @param clientId - The OAuth client ID
     * @param clientSecret - The OAuth client secret
     * @param credentialMetadata - The credential metadata (contains expiresAt)
     * @returns A valid access token
     */
    async getValidAccessToken(credentialId, clientId, clientSecret, credentialMetadata) {
        const credential = await this.credentialResolver(credentialId);
        const expiresAt = credentialMetadata.expiresAt;
        // Check if token is expired or about to expire (5 min buffer)
        if (expiresAt && this.isTokenExpired(expiresAt)) {
            this.logger.log(`Access token expired for credential ${credentialId}, refreshing...`);
            try {
                const result = await this.provider.refreshToken({
                    clientId,
                    clientSecret,
                    refreshToken: credential.refreshToken,
                });
                // Update credential with new tokens
                const newMetadata = {
                    ...credentialMetadata,
                    expiresAt: new Date(Date.now() + (result.expiresIn ?? 3600) * 1000).toISOString(),
                };
                if (result.scope) {
                    newMetadata.scope = result.scope;
                }
                await this.credentialUpdater(credentialId, {
                    clientId,
                    clientSecret,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken ?? credential.refreshToken,
                }, newMetadata);
                this.logger.log(`Access token refreshed successfully for credential ${credentialId}`);
                return result.accessToken;
            }
            catch (error) {
                this.logger.error(`Failed to refresh token for credential ${credentialId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                throw error;
            }
        }
        return credential.accessToken;
    }
    /**
     * Check if a token is expired or about to expire.
     */
    isTokenExpired(expiresAt, bufferMs = 5 * 60 * 1000) {
        return new Date(expiresAt).getTime() - bufferMs < Date.now();
    }
}
//# sourceMappingURL=token-manager.js.map