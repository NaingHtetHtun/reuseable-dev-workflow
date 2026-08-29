/**
 * Framework-independent OAuth 2.0 provider interfaces.
 *
 * These interfaces define the contract that OAuth providers must implement.
 * They are used by the API, code generator, and visual builder.
 */

/** OAuth 2.0 provider metadata (RFC 8414) */
export interface OAuthProviderMetadata {
  /** Unique provider identifier (e.g., 'google', 'github', 'apple') */
  type: string;
  /** Human-readable name */
  displayName: string;
  /** Provider description */
  description: string;
  /** Authorization endpoint URL */
  authorizationEndpoint: string;
  /** Token endpoint URL */
  tokenEndpoint: string;
  /** Token revocation endpoint URL (optional) */
  revocationEndpoint?: string;
  /** UserInfo endpoint URL (optional, for OIDC) */
  userinfoEndpoint?: string;
  /** Supported OAuth flows */
  supportedFlows: OAuthFlow[];
  /** Whether this provider supports PKCE */
  supportsPkce: boolean;
  /** Default scopes offered */
  defaultScopes: string[];
  /** Scopes that require special consent */
  sensitiveScopes?: string[];
}

/** OAuth flow types */
export type OAuthFlow = 'authorization-code' | 'client-credentials' | 'implicit';

/** PKCE code challenge methods */
export type PkceChallengeMethod = 'S256' | 'plain';

/** Parameters for building an authorization URL */
export interface OAuthAuthorizationParams {
  clientId: string;
  redirectUri: string;
  scope: string[];
  state: string;
  /** PKCE code challenge (if provider supports PKCE) */
  codeChallenge?: string;
  /** PKCE challenge method (default: 'S256') */
  codeChallengeMethod?: PkceChallengeMethod;
  /** Additional provider-specific parameters */
  extraParams?: Record<string, string>;
}

/** Result of building an authorization URL */
export interface OAuthAuthorizationUrl {
  url: string;
  state: string;
  /** PKCE code verifier (must be stored for token exchange) */
  codeVerifier?: string;
}

/** Parameters for exchanging an authorization code */
export interface OAuthTokenExchangeParams {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  /** PKCE code verifier (required if PKCE was used) */
  codeVerifier?: string;
}

/** Result of a token exchange */
export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
  /** ID token (for OpenID Connect, future) */
  idToken?: string;
  /** Provider-specific additional data */
  extra?: Record<string, unknown>;
}

/** Parameters for refreshing an access token */
export interface OAuthRefreshParams {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

/** OAuth error response */
export class OAuthError extends Error {
  constructor(
    public readonly error: string,
    public readonly errorDescription?: string,
    public readonly errorUri?: string,
  ) {
    super(errorDescription ?? error);
    this.name = 'OAuthError';
  }
}

/** The contract an OAuth provider must implement */
export interface OAuthProvider {
  /** Provider metadata */
  readonly metadata: OAuthProviderMetadata;

  /**
   * Build an authorization URL for the authorization code flow.
   * Generates a random state parameter for CSRF protection.
   * If provider supports PKCE, generates code challenge automatically.
   */
  buildAuthorizationUrl(params: OAuthAuthorizationParams): OAuthAuthorizationUrl;

  /**
   * Validate a state parameter against the expected value.
   * Returns true if valid, false if tampered or missing.
   */
  validateState(state: string, expectedState: string): boolean;

  /**
   * Exchange an authorization code for access/refresh tokens.
   * If PKCE was used, includes code_verifier in the request.
   */
  exchangeCode(params: OAuthTokenExchangeParams): Promise<OAuthTokenResult>;

  /**
   * Refresh an access token using a refresh token.
   */
  refreshToken(params: OAuthRefreshParams): Promise<OAuthTokenResult>;

  /**
   * Validate that a token exchange response is valid.
   */
  validateTokenResponse(response: unknown): response is OAuthTokenResult;
}
