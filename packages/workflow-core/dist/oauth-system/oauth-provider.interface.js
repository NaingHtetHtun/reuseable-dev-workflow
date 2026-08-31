/**
 * Framework-independent OAuth 2.0 provider interfaces.
 *
 * These interfaces define the contract that OAuth providers must implement.
 * They are used by the API, code generator, and visual builder.
 */
/** OAuth error response */
export class OAuthError extends Error {
  error;
  errorDescription;
  errorUri;
  constructor(error, errorDescription, errorUri) {
    super(errorDescription ?? error);
    this.error = error;
    this.errorDescription = errorDescription;
    this.errorUri = errorUri;
    this.name = 'OAuthError';
  }
}
//# sourceMappingURL=oauth-provider.interface.js.map
