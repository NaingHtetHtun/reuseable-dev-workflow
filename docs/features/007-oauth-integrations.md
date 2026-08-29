# 007 — OAuth / Authentication Integrations

## Status

**PLAN CREATED** — Awaiting approval.

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
4. **Authorization URL generation** — Build redirect URLs with correct parameters
5. **Callback handling** — Process authorization code from callback
6. **State parameter / CSRF protection** — Generate and validate state tokens
7. **Authorization code exchange** — Exchange code for access/refresh tokens
8. **Access token handling** — Store, use, and validate access tokens
9. **Refresh token handling** — Automatic token refresh when expired
10. **Token expiration tracking** — Store expiry in credential metadata
11. **Credential integration** — Store OAuth tokens in existing credential system
12. **OAuth scopes** — Define and request scopes per provider
13. **Provider metadata** — Endpoints, supported flows, supported scopes
14. **Error handling** — Provider-specific error mapping
15. **OAuth lifecycle** — Complete flow from authorization to token storage
16. **Node integration** — OAuth-aware node types can use provider abstraction
17. **API endpoints** — Authorization initiation and callback endpoints
18. **Testing** — Unit tests for provider logic, integration tests for API flow

### Non-Goals

- ❌ Complete Google Login feature (UI, user session management)
- ❌ Apple Login implementation
- ❌ GitHub/Microsoft OAuth implementations (architecture only)
- ❌ Laravel/NestJS generators (Phase 10-12)
- ❌ Visual workflow builder
- ❌ Frontend UI (except API contract documentation)
- ❌ User authentication/session management (Phase 14)
- ❌ OpenID Connect (future extension)
- ❌ PKCE flow (future extension for public clients)

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
  /** UserInfo endpoint URL (optional) */
  userinfoEndpoint?: string;
  /** Supported OAuth flows */
  supportedFlows: OAuthFlow[];
  /** Default scopes offered */
  defaultScopes: string[];
  /** Scopes that require special consent */
  sensitiveScopes?: string[];
}

/** OAuth flow types */
export type OAuthFlow = 'authorization-code' | 'client-credentials' | 'implicit';

/** Parameters for building an authorization URL */
export interface OAuthAuthorizationParams {
  clientId: string;
  redirectUri: string;
  scope: string[];
  state: string;
  /** Additional provider-specific parameters */
  extraParams?: Record<string, string>;
}

/** Result of building an authorization URL */
export interface OAuthAuthorizationUrl {
  url: string;
  state: string;
}

/** Parameters for exchanging an authorization code */
export interface OAuthTokenExchangeParams {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}

/** Result of a token exchange */
export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
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
   */
  buildAuthorizationUrl(params: OAuthAuthorizationParams): OAuthAuthorizationUrl;

  /**
   * Validate a state parameter against the expected value.
   * Returns true if valid, false if tampered or missing.
   */
  validateState(state: string, expectedState: string): boolean;

  /**
   * Exchange an authorization code for access/refresh tokens.
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

The Google provider implements the standard OAuth 2.0 Authorization Code flow:

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
    defaultScopes: ['openid', 'email', 'profile'],
  };

  buildAuthorizationUrl(params): OAuthAuthorizationUrl {
    // Google-specific parameter mapping
    // response_type=code, access_type=offline (for refresh token)
  }

  validateState(state, expectedState): boolean {
    // Constant-time comparison to prevent timing attacks
  }

  async exchangeCode(params): Promise<OAuthTokenResult> {
    // POST to tokenEndpoint with grant_type=authorization_code
  }

  async refreshToken(params): Promise<OAuthTokenResult> {
    // POST to tokenEndpoint with grant_type=refresh_token
  }

  validateTokenResponse(response): response is OAuthTokenResult {
    // Validate required fields present
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
  requiredCredentials: [
    { type: 'google-oauth2', name: 'Google OAuth2', required: true },
  ],
};
```

The node handler uses `context.resolveCredential(id)` to get the OAuth tokens, then calls the Google API.

### API Endpoints

The platform needs endpoints to initiate and handle OAuth flows:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/oauth/:provider/authorize` | Generate authorization URL and redirect |
| POST | `/api/v1/oauth/:provider/authorize` | Generate authorization URL (return JSON) |
| GET | `/api/v1/oauth/:provider/callback` | Handle OAuth callback (exchange code) |
| POST | `/api/v1/oauth/:provider/token` | Exchange code for tokens (manual) |
| POST | `/api/v1/oauth/:provider/refresh` | Refresh access token |
| GET | `/api/v1/oauth/providers` | List available OAuth providers |

**Flow:**

1. **Frontend** calls `POST /api/v1/oauth/google/authorize` with `projectId`, `scopes`, `redirectUri`
2. **API** generates state token, stores it, returns `authorizationUrl`
3. **Frontend** redirects user to `authorizationUrl`
4. **User** authorizes with Google
5. **Google** redirects to `GET /api/v1/oauth/google/callback?code=...&state=...`
6. **API** validates state, exchanges code for tokens, stores credential
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
- Node.js built-in `crypto` for HMAC signatures
- Node.js built-in `https` for token exchange requests
- Existing `@devflow/workflow-core` encryption service

### Updated Dependencies

None.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENCRYPTION_KEY` | Yes | Already exists (Phase 5) |
| `OAUTH_STATE_SECRET` | No | Secret for HMAC state signing (defaults to ENCRYPTION_KEY) |

## Security Considerations

| Concern | Mitigation |
|---------|-----------|
| CSRF attacks | State parameter with HMAC signature, single-use, 10-min expiry |
| State tampering | HMAC-SHA256 signature verification |
| Timing attacks | Constant-time comparison for state validation |
| Token storage | AES-256-GCM encryption at rest (Phase 5) |
| Client secrets | Encrypted in credential storage, never logged |
| Redirect URI validation | Strict URI matching, no open redirects |
| Authorization code reuse | Single-use codes (provider enforces) |
| Scope escalation | Request only necessary scopes |
| Token expiry | Automatic refresh with 5-min buffer |

## Testing Strategy

### Unit Tests (workflow-core)

- **OAuthProvider interface:**
  - Google provider builds correct authorization URL
  - State parameter is generated and validated
  - Token exchange handles success and error responses
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
  - Handles callback with valid code
  - Handles callback with invalid state
  - Stores credential after successful exchange

- **OAuthController:**
  - GET /authorize returns redirect URL
  - POST /authorize returns JSON URL
  - GET /callback handles success
  - GET /callback handles error from provider
  - POST /refresh refreshes token

### Integration Tests

- Complete OAuth flow simulation (mock provider)
- State token round-trip
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

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Google changes OAuth endpoints | Low | Medium | Metadata is configurable per provider |
| State token storage needs persistence | Medium | Low | In-memory for now, database table for production |
| Token refresh fails silently | Medium | High | Clear error handling, log failures |
| Provider-specific response formats | High | Medium | Provider validates its own responses |
| Redirect URI validation bypass | Low | High | Strict URI matching, no wildcards |

## How Future Providers Are Added

Adding a new OAuth provider requires:

1. Create `packages/workflow-core/src/oauth-system/providers/{provider}.oauth.provider.ts`
2. Implement `OAuthProvider` interface
3. Define `OAuthProviderMetadata` with correct endpoints
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
    defaultScopes: ['read:user', 'user:email'],
  };

  // GitHub-specific parameter mapping
  // GitHub returns tokens in URL-encoded format (not JSON)
  // GitHub uses 'client_secret' in POST body
}
```

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

- No PKCE flow (for public clients like SPAs)
- No OpenID Connect (authentication layer on top of OAuth)
- No token revocation implementation (endpoint exists but not called)
- No offline refresh token guarantee (depends on provider)
- State stored in-memory only (not persisted across restarts)

## Files Changed

| File | Action |
|------|--------|
| `packages/workflow-core/src/oauth-system/oauth-provider.interface.ts` | Created |
| `packages/workflow-core/src/oauth-system/oauth-provider-registry.ts` | Created |
| `packages/workflow-core/src/oauth-system/oauth-state.ts` | Created |
| `packages/workflow-core/src/oauth-system/token-manager.ts` | Created |
| `packages/workflow-core/src/oauth-system/providers/google-oauth.provider.ts` | Created |
| `packages/workflow-core/src/oauth-system/providers/index.ts` | Created |
| `packages/workflow-core/src/oauth-system/index.ts` | Created |
| `packages/workflow-core/src/oauth-system/*.spec.ts` | Created |
| `packages/workflow-core/src/index.ts` | Modified (add exports) |
| `apps/api/src/modules/oauth/oauth.module.ts` | Created |
| `apps/api/src/modules/oauth/oauth.service.ts` | Created |
| `apps/api/src/modules/oauth/oauth.controller.ts` | Created |
| `apps/api/src/modules/oauth/dto/*.ts` | Created |
| `apps/api/src/modules/oauth/*.spec.ts` | Created |
| `apps/api/src/app.module.ts` | Modified (add OAuthModule) |

## Completion Checklist

- [ ] Plan approved by human
- [ ] OAuthProvider interface defined
- [ ] OAuthProviderRegistry implemented
- [ ] OAuthStateManager implemented
- [ ] GoogleOAuthProvider implemented
- [ ] OAuthTokenManager implemented
- [ ] OAuthService created in API
- [ ] OAuthController created in API
- [ ] API endpoints work (authorize, callback, refresh)
- [ ] State parameter CSRF protection works
- [ ] Token exchange works with mock provider
- [ ] Token refresh works correctly
- [ ] Credentials stored after OAuth flow
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] `pnpm test` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Documentation updated
