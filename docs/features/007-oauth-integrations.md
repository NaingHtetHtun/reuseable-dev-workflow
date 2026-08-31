# 007 — OAuth / Authentication Integrations

## Status

**IMPLEMENTED** — Completed 2026-08-29.

## Goal

Establish a reusable, framework-independent OAuth integration architecture that supports multiple providers (Google, Apple, GitHub, Microsoft, etc.) and can be consumed by both the runtime workflow engine and the future code-generation system.

## Problem

The platform needs to support OAuth2 authorization flows for external services. Currently, credential storage exists (Phase 5) but there is no mechanism to:

1. Initiate an OAuth2 authorization flow
2. Handle callbacks and exchange authorization codes for tokens
3. Manage token lifecycle (refresh, expiration)
4. Abstract provider-specific differences behind a common interface
5. Export OAuth implementations to generated Laravel/NestJS projects

## Scope

### In Scope

1. **OAuth provider abstraction** — Framework-independent interface for OAuth providers
2. **OAuth provider registry** — Register and lookup providers by type
3. **Google OAuth provider** — First implementation (authorization code flow)
4. **PKCE support** — Code challenge/verifier generation and exchange (optional per provider)
5. **Authorization URL generation** — Build redirect URLs with correct parameters
6. **Callback handling** — Process authorization code from callback
7. **State parameter / CSRF protection** — Generate and validate state tokens
8. **Authorization code exchange** — Exchange code for access/refresh tokens
9. **Access token handling** — Store, use, and validate access tokens
10. **Refresh token handling** — Automatic token refresh when expired
11. **Token expiration tracking** — Store expiry in credential metadata
12. **Credential integration** — Store OAuth tokens in existing credential system
13. **OAuth scopes** — Define and request scopes per provider
14. **Provider metadata** — Endpoints, supported flows, supported scopes
15. **Error handling** — Provider-specific error mapping
16. **OAuth lifecycle** — Complete flow from authorization to token storage
17. **Node integration** — OAuth-aware node types can use provider abstraction
18. **API endpoints** — Authorization initiation and callback endpoints
19. **Testing** — Unit tests for provider logic, integration tests for API flow

### Non-Goals

- ❌ Complete Google Login feature (UI, user session management)
- ❌ Apple Login implementation
- ❌ GitHub/Microsoft OAuth implementations (architecture only)
- ❌ Laravel/NestJS generators (Phase 10-12)
- ❌ Visual workflow builder
- ❌ Frontend UI (except API contract documentation)
- ❌ User authentication/session management (Phase 14)

## Architecture Decisions

### PKCE Support — Implemented Now

**Decision:** PKCE is implemented in Phase 7 as an optional capability in the provider interface, with the Google provider supporting it.

**Rationale:**

1. **OAuth 2.1 requires PKCE for all authorization code flows** — PKCE is no longer optional for public clients; it is mandatory for ALL clients using the authorization code grant (RFC 7636, incorporated into OAuth 2.1 draft).
2. **Security best practice** — Even for confidential clients (server-side), PKCE protects against authorization code interception attacks.
3. **Google supports PKCE** — Google's authorization endpoint accepts `code_challenge` and `code_challenge_method` parameters.
4. **Future-proofing** — The platform may need to support public clients (SPAs, mobile apps) in the future.
5. **Minimal implementation cost** — PKCE adds only `code_verifier` (random string) and `code_challenge` (SHA256 of verifier) to the flow.

**Implementation approach:**

- `OAuthProvider` interface includes optional `supportsPkce` flag
- `OAuthAuthorizationParams` includes optional `codeChallenge` and `codeChallengeMethod`
- `OAuthTokenExchangeParams` includes optional `codeVerifier`
- `OAuthPkceHelper` utility generates `code_verifier` and `code_challenge`
- Google provider sets `supportsPkce = true` and includes PKCE parameters by default
- PKCE is transparent to the caller — the provider handles it internally

**What this means:**

- Authorization URL automatically includes `code_challenge` when PKCE is supported
- Token exchange automatically includes `code_verifier`
- No separate PKCE flow — it's integrated into the standard authorization code flow
- Providers that don't support PKCE simply ignore the parameters

### OpenID Connect — Designed for Future, Not Implemented Now

**Decision:** OpenID Connect is NOT implemented in Phase 7. The architecture is designed to support it as a future extension.

**Rationale:**

1. **Google Login requires OpenID Connect** — For user authentication (login), Google requires OIDC. OAuth-only provides authorization (API access), not authentication (user identity).
2. **Phase 7 focus is OAuth infrastructure** — The goal is to establish the OAuth abstraction layer, not build a complete login system.
3. **OIDC is a layer on top of OAuth** — OIDC adds an ID token (JWT) and userinfo endpoint to the standard OAuth flow.
4. **The architecture naturally supports OIDC** — The `OAuthTokenResult` already has an `extra` field for provider-specific data (like ID tokens). The `userinfoEndpoint` is already in `OAuthProviderMetadata`.

**How OIDC will be added later:**

1. Add `idToken` field to `OAuthTokenResult`
2. Add `nonce` parameter to authorization URL (for ID token validation)
3. Add ID token validation (JWT signature verification)
4. Add `parseIdToken(token)` method to `OAuthProvider` interface
5. Google provider returns ID token when `openid` scope is requested

**For Phase 7, the Google provider:**

- Uses OAuth 2.0 Authorization Code flow
- Requests `email profile` scopes (not `openid` initially)
- Stores access token and refresh token
- Does NOT handle ID tokens or authentication
- The `userinfoEndpoint` is available for future use

**This is correct for the platform's use case:**

- Phase 7 enables API access to Google services (Drive, Calendar, etc.)
- The Google Login feature (user authentication) will be built on top of this in a future phase
- The architecture supports both OAuth-only and OIDC flows

## Scope (Detailed)

### In Scope

1. **OAuth provider abstraction** — Framework-independent interface for OAuth providers
2. **OAuth provider registry** — Register and lookup providers by type
3. **Google OAuth provider** — First implementation (authorization code flow with PKCE)
4. **PKCE support** — Code challenge/verifier generation and exchange
5. **Authorization URL generation** — Build redirect URLs with correct parameters
6. **Callback handling** — Process authorization code from callback
7. **State parameter / CSRF protection** — Generate and validate state tokens
8. **Authorization code exchange** — Exchange code for access/refresh tokens
9. **Access token handling** — Store, use, and validate access tokens
10. **Refresh token handling** — Automatic token refresh when expired
11. **Token expiration tracking** — Store expiry in credential metadata
12. **Credential integration** — Store OAuth tokens in existing credential system
13. **OAuth scopes** — Define and request scopes per provider
14. **Provider metadata** — Endpoints, supported flows, supported scopes
15. **Error handling** — Provider-specific error mapping
16. **OAuth lifecycle** — Complete flow from authorization to token storage
17. **Node integration** — OAuth-aware node types can use provider abstraction
18. **API endpoints** — Authorization initiation and callback endpoints
19. **Testing** — Unit tests for provider logic, integration tests for API flow

### Non-Goals

- ❌ Complete Google Login feature (UI, user session management)
- ❌ Apple Login implementation
- ❌ GitHub/Microsoft OAuth implementations (architecture only)
- ❌ Laravel/NestJS generators (Phase 10-12)
- ❌ Visual workflow builder
- ❌ Frontend UI (except API contract documentation)
- ❌ User authentication/session management (Phase 14)
- ❌ OpenID Connect ID token validation (future extension)
- ❌ OpenID Connect userinfo endpoint integration (future extension)

## Architecture

### Provider Abstraction

The core abstraction lives in `packages/workflow-core` — framework-independent:

```typescript
// packages/workflow-core/src/oauth-system/oauth-provider.interface.ts

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
export interface OAuthError {
  error: string;
  errorDescription?: string;
  errorUri?: string;
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
```

### PKCE Helper

```typescript
// packages/workflow-core/src/oauth-system/pkce-helper.ts

import * as crypto from 'crypto';

export interface PkceChallenge {
  codeVerifier: string;
  codeChallenge: string;
  method: 'S256' | 'plain';
}

/**
 * PKCE helper for generating code verifiers and challenges.
 * Implements RFC 7636.
 */
export class PkceHelper {
  /**
   * Generate a PKCE code verifier.
   * Returns a cryptographically random string (43-128 characters).
   */
  static generateCodeVerifier(length = 64): string {
    const buffer = crypto.randomBytes(length);
    return buffer.toString('base64url').substring(0, length);
  }

  /**
   * Generate a PKCE code challenge from a code verifier.
   * Supports S256 (SHA-256) and plain methods.
   */
  static generateCodeChallenge(codeVerifier: string, method: 'S256' | 'plain' = 'S256'): string {
    if (method === 'plain') {
      return codeVerifier;
    }
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  }

  /**
   * Generate a complete PKCE challenge pair.
   */
  static generate(): PkceChallenge {
    const codeVerifier = PkceHelper.generateCodeVerifier();
    const codeChallenge = PkceHelper.generateCodeChallenge(codeVerifier, 'S256');
    return {
      codeVerifier,
      codeChallenge,
      method: 'S256',
    };
  }
}
```

### OAuth Provider Registry

```typescript
// packages/workflow-core/src/oauth-system/oauth-provider-registry.ts

export class OAuthProviderRegistry {
  private providers = new Map<string, OAuthProvider>();

  register(provider: OAuthProvider): void;
  get(type: string): OAuthProvider | undefined;
  hasType(type: string): boolean;
  getAll(): OAuthProvider[];
  getMetadata(type: string): OAuthProviderMetadata | undefined;
}
```

### Google OAuth Provider

The Google provider implements the standard OAuth 2.0 Authorization Code flow with PKCE:

```typescript
// packages/workflow-core/src/oauth-system/providers/google-oauth.provider.ts

export class GoogleOAuthProvider implements OAuthProvider {
  readonly metadata: OAuthProviderMetadata = {
    type: 'google-oauth2',
    displayName: 'Google OAuth2',
    description: 'Google OAuth2 authentication',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    userinfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo',
    supportedFlows: ['authorization-code'],
    supportsPkce: true, // Google supports PKCE
    defaultScopes: ['email', 'profile'],
  };

  buildAuthorizationUrl(params): OAuthAuthorizationUrl {
    // Generate PKCE challenge if not provided
    const pkce = params.codeChallenge
      ? { codeChallenge: params.codeChallenge, method: params.codeChallengeMethod ?? 'S256' }
      : PkceHelper.generate();

    const url = new URL(this.metadata.authorizationEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', params.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', params.scope.join(' '));
    url.searchParams.set('state', params.state);
    url.searchParams.set('code_challenge', pkce.codeChallenge);
    url.searchParams.set('code_challenge_method', pkce.method);
    // access_type=offline for refresh token
    url.searchParams.set('access_type', 'offline');

    return {
      url: url.toString(),
      state: params.state,
      codeVerifier: pkce.codeVerifier,
    };
  }

  validateState(state, expectedState): boolean {
    // Constant-time comparison
    if (state.length !== expectedState.length) return false;
    return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));
  }

  async exchangeCode(params): Promise<OAuthTokenResult> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: params.clientId,
      client_secret: params.clientSecret,
      code: params.code,
      redirect_uri: params.redirectUri,
    });

    if (params.codeVerifier) {
      body.set('code_verifier', params.codeVerifier);
    }

    const response = await fetch(this.metadata.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new OAuthError(data.error, data.error_description);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  async refreshToken(params): Promise<OAuthTokenResult> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: params.clientId,
      client_secret: params.clientSecret,
      refresh_token: params.refreshToken,
    });

    const response = await fetch(this.metadata.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new OAuthError(data.error, data.error_description);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? params.refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  validateTokenResponse(response): response is OAuthTokenResult {
    return (
      typeof response === 'object' &&
      response !== null &&
      'accessToken' in response &&
      typeof (response as OAuthTokenResult).accessToken === 'string'
    );
  }
}
```

### OAuth State Management

The state parameter prevents CSRF attacks. The platform manages state tokens:

```typescript
// packages/workflow-core/src/oauth-system/oauth-state.ts

export interface OAuthStateData {
  /** Random state token */
  state: string;
  /** Provider type */
  providerType: string;
  /** Credential ID being authorized (if updating existing) */
  credentialId?: string;
  /** Project ID */
  projectId: string;
  /** Timestamp */
  createdAt: number;
  /** Optional return URL after authorization */
  returnUrl?: string;
}

export class OAuthStateManager {
  /**
   * Generate a new state token with metadata.
   * Signs the state to prevent tampering.
   */
  generateState(data: Omit<OAuthStateData, 'state'>): string;

  /**
   * Validate and decode a state token.
   * Returns null if invalid or expired.
   */
  validateState(state: string): OAuthStateData | null;

  /**
   * Check if a state token has expired.
   */
  isExpired(stateData: OAuthStateData, maxAgeMs?: number): boolean;
}
```

**State format:** Base64url-encoded JSON + HMAC signature

```
base64url(state_data) + "." + hmac-sha256(state_data, secret)
```

**Security considerations:**

- State tokens expire after 10 minutes (configurable)
- HMAC signature prevents tampering
- State is single-use (consumed on callback)
- Project ID is embedded to prevent cross-project attacks

### Credential Integration

OAuth tokens are stored using the existing credential system (Phase 5):

```typescript
// When an OAuth flow completes:
const credentialData = {
  clientId: params.clientId,
  clientSecret: params.clientSecret,
  accessToken: tokenResult.accessToken,
  refreshToken: tokenResult.refreshToken,
};

const metadata = {
  expiresAt: new Date(Date.now() + tokenResult.expiresIn * 1000).toISOString(),
  scope: tokenResult.scope,
  provider: 'google-oauth2',
};

// Store via existing CredentialsService
await credentialsService.create(projectId, {
  name: 'Google OAuth - User Email',
  type: 'google-oauth2',
  data: credentialData,
  metadata,
});
```

### Token Refresh Strategy

Tokens are refreshed on-demand, not via background jobs:

1. Node handler checks `metadata.expiresAt` before using token
2. If expired or about to expire, calls `OAuthProvider.refreshToken()`
3. Updates credential with new tokens
4. Returns fresh access token

```typescript
// packages/workflow-core/src/oauth-system/token-manager.ts

export class OAuthTokenManager {
  constructor(
    private readonly provider: OAuthProvider,
    private readonly credentialResolver: (id: string) => Promise<Record<string, unknown>>,
    private readonly credentialUpdater: (id: string, data: Record<string, unknown>, metadata: Record<string, unknown>) => Promise<void>,
  ) {}

  /**
   * Get a valid access token, refreshing if necessary.
   */
  async getValidAccessToken(
    credentialId: string,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    const credential = await this.credentialResolver(credentialId);
    const metadata = /* get metadata from credential */;

    // Check if token is expired or about to expire (5 min buffer)
    if (this.isTokenExpired(metadata.expiresAt)) {
      const result = await this.provider.refreshToken({
        clientId,
        clientSecret,
        refreshToken: credential.refreshToken as string,
      });

      // Update credential with new tokens
      await this.credentialUpdater(credentialId, {
        ...credential,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken ?? credential.refreshToken,
      }, {
        ...metadata,
        expiresAt: new Date(Date.now() + (result.expiresIn ?? 3600) * 1000).toISOString(),
      });

      return result.accessToken;
    }

    return credential.accessToken as string;
  }

  private isTokenExpired(expiresAt: string, bufferMs = 5 * 60 * 1000): boolean {
    return new Date(expiresAt).getTime() - bufferMs < Date.now();
  }
}
```

### Node Integration

OAuth-aware nodes can use the provider abstraction via the execution context:

```typescript
// Future OAuth-aware node example
const googleUserInfoDefinition: NodeTypeDefinition = {
  type: 'google-user-info',
  displayName: 'Google User Info',
  description: 'Get authenticated user profile from Google',
  category: 'integration',
  version: 1,
  parameterSchema: { type: 'object', properties: {} },
  inputSchema: { type: 'object', properties: {} },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
    },
  },
  requiredCredentials: [{ type: 'google-oauth2', name: 'Google OAuth2', required: true }],
};
```

The node handler uses `context.resolveCredential(id)` to get the OAuth tokens, then calls the Google API.

### API Endpoints

The platform needs endpoints to initiate and handle OAuth flows:

| Method | Path                                | Description                              |
| ------ | ----------------------------------- | ---------------------------------------- |
| GET    | `/api/v1/oauth/:provider/authorize` | Generate authorization URL and redirect  |
| POST   | `/api/v1/oauth/:provider/authorize` | Generate authorization URL (return JSON) |
| GET    | `/api/v1/oauth/:provider/callback`  | Handle OAuth callback (exchange code)    |
| POST   | `/api/v1/oauth/:provider/token`     | Exchange code for tokens (manual)        |
| POST   | `/api/v1/oauth/:provider/refresh`   | Refresh access token                     |
| GET    | `/api/v1/oauth/providers`           | List available OAuth providers           |

**Flow:**

1. **Frontend** calls `POST /api/v1/oauth/google/authorize` with `projectId`, `scopes`, `redirectUri`
2. **API** generates state token, stores it, returns `authorizationUrl` and `codeVerifier` (for PKCE)
3. **Frontend** redirects user to `authorizationUrl`
4. **User** authorizes with Google
5. **Google** redirects to `GET /api/v1/oauth/google/callback?code=...&state=...`
6. **API** validates state, exchanges code for tokens (with codeVerifier if PKCE), stores credential
7. **API** redirects to `returnUrl` with success/error

### Prisma Schema Changes

No new models needed. OAuth state is stored in memory (or a simple table for production):

```prisma
// Optional: For production, store state tokens in database
model OAuthState {
  id        String   @id @default(cuid())
  state     String   @unique
  projectId String   @map("project_id")
  provider  String
  credentialId String? @map("credential_id")
  returnUrl String?  @map("return_url")
  expiresAt DateTime @map("expires_at")
  used      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([state])
  @@index([projectId])
  @@map("oauth_states")
}
```

**Note:** For Phase 7, state can be managed in-memory with HMAC signing. The database table is for future production hardening.

### File Structure

#### packages/workflow-core (framework-independent)

```
packages/workflow-core/src/
├── oauth-system/
│   ├── oauth-provider.interface.ts       # OAuthProvider, OAuthProviderMetadata, etc.
│   ├── oauth-provider-registry.ts        # Registry of OAuth providers
│   ├── oauth-provider-registry.spec.ts
│   ├── oauth-state.ts                    # State token generation/validation
│   ├── oauth-state.spec.ts
│   ├── pkce-helper.ts                    # PKCE code verifier/challenge generation
│   ├── pkce-helper.spec.ts
│   ├── token-manager.ts                  # Token refresh logic
│   ├── token-manager.spec.ts
│   ├── providers/
│   │   ├── google-oauth.provider.ts      # Google OAuth implementation
│   │   ├── google-oauth.provider.spec.ts
│   │   └── index.ts                      # Barrel export
│   └── index.ts                          # Barrel export
├── credential-system/                    # Unchanged (Phase 5)
├── node-system/                          # Unchanged (Phase 4)
└── index.ts                              # Updated exports
```

#### apps/api (NestJS)

```
apps/api/src/
├── modules/
│   └── oauth/
│       ├── oauth.module.ts
│       ├── oauth.service.ts              # OAuth flow orchestration
│       ├── oauth.controller.ts           # API endpoints
│       ├── oauth.service.spec.ts
│       ├── oauth.controller.spec.ts
│       └── dto/
│           ├── authorize.dto.ts
│           ├── callback.dto.ts
│           └── index.ts
```

## Dependencies

### New Dependencies

None. The OAuth implementation uses:

- Node.js built-in `crypto` for HMAC signatures and PKCE challenges
- Node.js built-in `fetch` for token exchange requests (Node 18+)
- Existing `@devflow/workflow-core` encryption service

### Updated Dependencies

None.

## Environment Variables

| Variable             | Required | Description                                                |
| -------------------- | -------- | ---------------------------------------------------------- |
| `ENCRYPTION_KEY`     | Yes      | Already exists (Phase 5)                                   |
| `OAUTH_STATE_SECRET` | No       | Secret for HMAC state signing (defaults to ENCRYPTION_KEY) |

## Security Considerations

| Concern                         | Mitigation                                                     |
| ------------------------------- | -------------------------------------------------------------- |
| CSRF attacks                    | State parameter with HMAC signature, single-use, 10-min expiry |
| State tampering                 | HMAC-SHA256 signature verification                             |
| Timing attacks                  | Constant-time comparison for state validation                  |
| Authorization code interception | PKCE (S256) for all providers that support it                  |
| Token storage                   | AES-256-GCM encryption at rest (Phase 5)                       |
| Client secrets                  | Encrypted in credential storage, never logged                  |
| Redirect URI validation         | Strict URI matching, no open redirects                         |
| Authorization code reuse        | Single-use codes (provider enforces)                           |
| Scope escalation                | Request only necessary scopes                                  |
| Token expiry                    | Automatic refresh with 5-min buffer                            |
| PKCE verifier storage           | Stored in state token, not in database                         |

## Testing Strategy

### Unit Tests (workflow-core)

- **PkceHelper:**
  - Generates valid code verifier (correct length, base64url)
  - Generates valid code challenge (SHA256 of verifier)
  - S256 and plain methods work correctly

- **OAuthProvider interface:**
  - Google provider builds correct authorization URL
  - Authorization URL includes PKCE code_challenge
  - State parameter is generated and validated
  - Token exchange handles success and error responses
  - Token exchange includes code_verifier when PKCE used
  - Token refresh works correctly

- **OAuthStateManager:**
  - Generates valid state tokens
  - Validates state tokens correctly
  - Rejects expired state tokens
  - Rejects tampered state tokens

- **OAuthProviderRegistry:**
  - Registers and retrieves providers
  - Rejects duplicate registration

- **OAuthTokenManager:**
  - Returns valid token when not expired
  - Refreshes token when expired
  - Handles refresh token failure

### Unit Tests (API)

- **OAuthService:**
  - Generates authorization URL with correct parameters
  - Generates PKCE challenge for supported providers
  - Handles callback with valid code
  - Handles callback with invalid state
  - Stores credential after successful exchange

- **OAuthController:**
  - GET /authorize returns redirect URL
  - POST /authorize returns JSON URL with codeVerifier
  - GET /callback handles success
  - GET /callback handles error from provider
  - POST /refresh refreshes token

### Integration Tests

- Complete OAuth flow simulation (mock provider)
- State token round-trip
- PKCE challenge/verifier round-trip
- Token storage and retrieval
- Credential creation after OAuth flow

## Verification Commands

```bash
# Run all tests
pnpm test

# Run workflow-core tests
cd packages/workflow-core && pnpm test

# Run API tests
cd apps/api && ENCRYPTION_KEY=<key> pnpm test

# Typecheck
pnpm typecheck

# Lint
pnpm lint
```

## Risks

| Risk                                  | Likelihood | Impact | Mitigation                                               |
| ------------------------------------- | ---------- | ------ | -------------------------------------------------------- |
| Google changes OAuth endpoints        | Low        | Medium | Metadata is configurable per provider                    |
| State token storage needs persistence | Medium     | Low    | In-memory for now, database table for production         |
| Token refresh fails silently          | Medium     | High   | Clear error handling, log failures                       |
| Provider-specific response formats    | High       | Medium | Provider validates its own responses                     |
| Redirect URI validation bypass        | Low        | High   | Strict URI matching, no wildcards                        |
| PKCE verifier exposure                | Low        | Medium | Verifier stored in state token, not persisted separately |

## How Future Providers Are Added

Adding a new OAuth provider requires:

1. Create `packages/workflow-core/src/oauth-system/providers/{provider}.oauth.provider.ts`
2. Implement `OAuthProvider` interface
3. Define `OAuthProviderMetadata` with correct endpoints and `supportsPkce`
4. Register in `OAuthProviderRegistry`
5. No changes to core OAuth architecture

**Example: GitHub OAuth Provider**

```typescript
export class GitHubOAuthProvider implements OAuthProvider {
  readonly metadata: OAuthProviderMetadata = {
    type: 'github',
    displayName: 'GitHub OAuth',
    description: 'GitHub OAuth2 authentication',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    supportedFlows: ['authorization-code'],
    supportsPkce: false, // GitHub does not support PKCE
    defaultScopes: ['read:user', 'user:email'],
  };

  // GitHub-specific parameter mapping
  // GitHub returns tokens in URL-encoded format (not JSON)
  // GitHub uses 'client_secret' in POST body
}
```

## How OpenID Connect Will Be Added Later

The architecture naturally supports OIDC as a future extension:

1. **Add `idToken` to `OAuthTokenResult`** — Already has `extra` field, but explicit is better
2. **Add `nonce` parameter** — Required for ID token validation
3. **Add ID token validation** — JWT signature verification using provider's JWKS
4. **Add `parseIdToken(token)` to `OAuthProvider`** — Parse and validate ID token
5. **Google provider returns ID token** — When `openid` scope is requested

**This is intentionally deferred because:**

- Phase 7 focuses on OAuth infrastructure (authorization)
- Google Login (authentication) is a separate feature
- OIDC adds complexity (JWT validation, JWKS fetching)
- The current architecture supports it without changes

## How Code Generator Consumes OAuth Definitions

The OAuth provider metadata and flow definition can be consumed by the code generator:

```typescript
// Future code generator reads:
const provider = oauthProviderRegistry.get('google-oauth2');

// Generates Laravel code:
// - routes/web.php: OAuth routes
// - app/Http/Controllers/OAuthController.php: Authorization + callback
// - config/services.php: Google OAuth configuration
// - .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

// Generates NestJS code:
// - src/modules/auth/auth.module.ts
// - src/modules/auth/auth.controller.ts
// - src/modules/auth/auth.service.ts
// - src/config/oauth.config.ts
```

The key insight: the OAuth provider metadata (endpoints, scopes, parameters) is data that the code generator can read and use to generate framework-specific implementations.

## Known Limitations

- No OpenID Connect ID token validation (future extension)
- No OpenID Connect userinfo endpoint integration (future extension)
- No token revocation implementation (endpoint exists but not called)
- No offline refresh token guarantee (depends on provider)
- State stored in-memory only (not persisted across restarts)

## Files Changed

| File                                                                         | Action                     |
| ---------------------------------------------------------------------------- | -------------------------- |
| `packages/workflow-core/src/oauth-system/oauth-provider.interface.ts`        | Created                    |
| `packages/workflow-core/src/oauth-system/oauth-provider-registry.ts`         | Created                    |
| `packages/workflow-core/src/oauth-system/oauth-state.ts`                     | Created                    |
| `packages/workflow-core/src/oauth-system/pkce-helper.ts`                     | Created                    |
| `packages/workflow-core/src/oauth-system/token-manager.ts`                   | Created                    |
| `packages/workflow-core/src/oauth-system/providers/google-oauth.provider.ts` | Created                    |
| `packages/workflow-core/src/oauth-system/providers/index.ts`                 | Created                    |
| `packages/workflow-core/src/oauth-system/index.ts`                           | Created                    |
| `packages/workflow-core/src/oauth-system/*.spec.ts`                          | Created                    |
| `packages/workflow-core/src/index.ts`                                        | Modified (add exports)     |
| `apps/api/src/modules/oauth/oauth.module.ts`                                 | Created                    |
| `apps/api/src/modules/oauth/oauth.service.ts`                                | Created                    |
| `apps/api/src/modules/oauth/oauth.controller.ts`                             | Created                    |
| `apps/api/src/modules/oauth/dto/*.ts`                                        | Created                    |
| `apps/api/src/modules/oauth/*.spec.ts`                                       | Created                    |
| `apps/api/src/app.module.ts`                                                 | Modified (add OAuthModule) |

## Completion Checklist

- [x] Plan approved by human
- [x] OAuthProvider interface defined
- [x] OAuthProviderRegistry implemented
- [x] PkceHelper implemented
- [x] OAuthStateManager implemented
- [x] GoogleOAuthProvider implemented (with PKCE)
- [x] OAuthTokenManager implemented
- [x] OAuthService created in API
- [x] OAuthController created in API
- [x] API endpoints work (authorize, callback, refresh)
- [x] State parameter CSRF protection works
- [x] PKCE works with Google provider
- [x] Token exchange works with mock provider
- [x] Token refresh works correctly
- [x] Credentials stored after OAuth flow
- [x] Unit tests pass (150 in workflow-core, 71 in API)
- [x] `pnpm test` passes
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Documentation updated
