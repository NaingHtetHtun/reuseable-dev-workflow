# 006 — Credentials / Integrations

## Status

**IMPLEMENTED** — Completed 2026-08-29.

## Goal

Implement secure credential storage and management for external service integrations. Credentials are the foundation that enables workflow nodes to authenticate with external APIs (Google, GitHub, email providers, etc.).

## Problem

Workflow nodes like `http-request` need to call authenticated APIs. Currently, there is no way to store, manage, or reference credentials securely. Developers would have to hardcode API keys or tokens, which is insecure and unmaintainable.

## Scope

### In Scope

1. **Credential data model** — Prisma schema for encrypted credential storage
2. **Encryption service** — AES-256-GCM encryption at rest (no new dependencies)
3. **Credential CRUD API** — Create, list, get, update, delete (secrets never returned)
4. **Credential types** — Define what fields each integration type requires
5. **Integration registry** — Framework-independent registry of supported integrations
6. **Node integration** — `resolveCredential` in execution context
7. **OAuth2 types** — Framework-independent OAuth2 credential structure
8. **Credential validation** — Validate credentials against their type schema
9. **Testing** — Unit tests for encryption, validation, service; integration tests for API

### Non-Goals

- ❌ Google Login implementation — Phase 7
- ❌ Apple Login — Future
- ❌ OAuth2 authorization flows (redirect, callback) — Phase 7
- ❌ Frontend UI for credential management
- ❌ Credential rotation automation
- ❌ Credential sharing between projects
- ❌ Audit logging
- ❌ Credential versioning

## Architecture

### Credential Model

```
Credential
├── id: string (cuid)
├── projectId: string (FK → Project)
├── name: string (human-readable label)
├── type: string (e.g., 'google-oauth2', 'github-token', 'smtp', 'api-key')
├── data: string (encrypted JSON blob)
├── metadata: Json? (non-secret info like token expiry, scopes)
├── createdAt: DateTime
├── updatedAt: DateTime
```

**Key design decisions:**

- `data` stores the encrypted JSON of all secret fields (API keys, tokens, passwords)
- `metadata` stores non-secret information (token expiry, scopes, username) — queryable, not encrypted
- Credentials are scoped to projects (same as workflows)
- The `type` field determines what fields are expected in `data`

### Encryption Strategy

**Algorithm:** AES-256-GCM (authenticated encryption)

**Why AES-256-GCM:**
- Authenticated encryption (confidentiality + integrity)
- No external dependencies (Node.js `crypto` built-in)
- Standard, well-tested, widely supported
- Random IV per encryption operation

**Key management:**
- Encryption key stored in `ENCRYPTION_KEY` environment variable
- 32-byte (256-bit) hex-encoded key
- Key is loaded once at service initialization
- Never logged, never returned in API responses

**Format of encrypted data:**
```
base64(iv + authTag + ciphertext)
```

**Encryption service (framework-independent):**

```typescript
// packages/workflow-core/src/credential-system/encryption.ts
export class EncryptionService {
  constructor(private readonly key: Buffer) {}

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(encryptedData: string): string {
    const buf = Buffer.from(encryptedData, 'base64');
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext) + decipher.final('utf8');
  }
}
```

### Credential Types

Each credential type defines what fields are expected:

```typescript
// packages/workflow-core/src/credential-system/credential-types.ts
export interface CredentialTypeDefinition {
  type: string;
  displayName: string;
  description: string;
  /** Fields that are stored as secrets (encrypted) */
  secretFields: CredentialField[];
  /** Fields that are stored as metadata (not encrypted) */
  metadataFields: CredentialField[];
}

export interface CredentialField {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description?: string;
  /** For OAuth2: field name that holds the refresh token */
  isRefreshToken?: boolean;
  /** For OAuth2: field name that holds the access token */
  isAccessToken?: boolean;
  /** For OAuth2: field name that holds the expiry timestamp */
  isExpiryField?: boolean;
}
```

**Built-in credential types:**

| Type | Secret Fields | Metadata Fields |
|------|--------------|-----------------|
| `api-key` | `apiKey` | `headerName` (default: Authorization) |
| `bearer-token` | `token` | — |
| `basic-auth` | `username`, `password` | — |
| `google-oauth2` | `accessToken`, `refreshToken` | `clientId`, `clientSecret`, `expiresAt`, `scopes` |
| `github-token` | `token` | — |
| `smtp` | `host`, `port`, `username`, `password`, `fromEmail` | `secure` (boolean) |

**Note:** Google OAuth2 credential type is defined here for storage purposes only. The actual OAuth2 authorization flow (redirect, callback, token exchange) is implemented in Phase 7.

### Integration Registry

```typescript
// packages/workflow-core/src/credential-system/integration-registry.ts
export class IntegrationRegistry {
  private types = new Map<string, CredentialTypeDefinition>();

  register(definition: CredentialTypeDefinition): void;
  get(type: string): CredentialTypeDefinition | undefined;
  getAll(): CredentialTypeDefinition[];
  validate(data: Record<string, unknown>, type: string): ValidationResult;
}
```

### Node Execution Context Update

The `NodeExecutionContext` gains a `resolveCredential` function:

```typescript
// packages/workflow-core/src/node-system/interfaces.ts
export interface NodeExecutionContext {
  workflowId: string;
  executionId: string;
  nodeId: string;
  nodeResults: Map<string, unknown>;
  startedAt: Date;
  /** Resolve a credential by ID (Phase 5) */
  resolveCredential?(id: string): Promise<Record<string, unknown>>;
}
```

**How it works:**

1. Node type declares `requiredCredentials` in its definition
2. Workflow definition includes `credentialIds` on nodes
3. Executor receives a `credentialResolver` function
4. Before executing a node, executor validates that all required credentials are provided
5. Node handler calls `context.resolveCredential(id)` to get decrypted credential data

### Executor Update

```typescript
// packages/workflow-core/src/executor.ts
export type CredentialResolver = (id: string) => Promise<Record<string, unknown>>;

export class WorkflowExecutor {
  constructor(
    logger?: Logger,
    credentialResolver?: CredentialResolver,
  ) { ... }

  async execute(
    workflowId: string,
    executionId: string,
    definition: WorkflowDefinition,
    input: unknown,
  ): Promise<ExecutionResult> { ... }
}
```

The executor passes `resolveCredential` to the node context:

```typescript
const nodeContext: NodeExecutionContext = {
  ...existingFields,
  resolveCredential: this.credentialResolver
    ? (id) => this.credentialResolver(id)
    : undefined,
};
```

### API Layer

**NestJS module:** `apps/api/src/modules/credentials/`

```
credentials/
├── credentials.module.ts
├── credentials.service.ts
├── credentials.controller.ts
├── dto/
│   ├── create-credential.dto.ts
│   ├── update-credential.dto.ts
│   ├── credential-response.dto.ts
│   └── credential-query.dto.ts
└── credentials.controller.spec.ts
```

**API Endpoints:**

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/projects/:projectId/credentials` | 201 | Create credential |
| GET | `/api/v1/projects/:projectId/credentials` | 200 | List credentials (paginated) |
| GET | `/api/v1/projects/:projectId/credentials/:id` | 200 | Get credential (no secrets) |
| PATCH | `/api/v1/projects/:projectId/credentials/:id` | 200 | Update credential |
| DELETE | `/api/v1/projects/:projectId/credentials/:id` | 204 | Delete credential |
| GET | `/api/v1/credential-types` | 200 | List available credential types |

**Security rules:**
- Secret values are NEVER returned in API responses
- `GET` response includes: id, name, type, metadata, createdAt, updatedAt
- `data` field (secrets) is stripped from all responses
- Credential creation/update requires `data` field with all required secret fields

### Data Model (Prisma)

```prisma
model Credential {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String
  type      String
  data      String   // Encrypted JSON blob
  metadata  Json?    // Non-secret metadata (queryable)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([projectId, name])
  @@index([projectId])
  @@index([type])
}
```

### Workflow Definition Update

Nodes can reference credentials:

```json
{
  "id": "node-1",
  "type": "http-request",
  "name": "Call Google API",
  "parameters": {
    "url": "https://www.googleapis.com/oauth2/v2/userinfo",
    "method": "GET"
  },
  "credentialIds": ["cred-abc123"]
}
```

The executor resolves these credentials and passes them to the node handler.

## File Structure

### packages/workflow-core (framework-independent)

```
packages/workflow-core/src/
├── credential-system/
│   ├── encryption.ts              # AES-256-GCM encrypt/decrypt
│   ├── encryption.spec.ts         # Encryption tests
│   ├── credential-types.ts        # CredentialTypeDefinition, CredentialField
│   ├── credential-types.spec.ts   # Credential type validation tests
│   ├── integration-registry.ts    # Registry of credential types
│   ├── integration-registry.spec.ts
│   └── index.ts                   # Barrel export
├── node-system/
│   └── interfaces.ts              # Updated with resolveCredential
├── executor.ts                    # Updated with CredentialResolver
└── index.ts                       # Updated exports
```

### apps/api (NestJS)

```
apps/api/src/
├── modules/
│   └── credentials/
│       ├── credentials.module.ts
│       ├── credentials.service.ts
│       ├── credentials.controller.ts
│       ├── dto/
│       │   ├── create-credential.dto.ts
│       │   ├── update-credential.dto.ts
│       │   ├── credential-response.dto.ts
│       │   └── index.ts
│       └── credentials.controller.spec.ts
├── shared/
│   └── database/
│       └── prisma.service.ts      # Unchanged
├── modules/
│   └── workflows/
│       └── workflows.service.ts   # Updated to pass credentialResolver
```

## Dependencies

### New Dependencies

None. The encryption uses Node.js built-in `crypto` module.

### Updated Dependencies

| Package | Change | Rationale |
|---------|--------|-----------|
| `@devflow/workflow-core` | Added credential-system | Framework-independent credential types and encryption |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENCRYPTION_KEY` | Yes | 32-byte hex-encoded AES-256 key |

**Example:**
```bash
# Generate a key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing Strategy

### Unit Tests (workflow-core)

- **EncryptionService:**
  - Encrypts and decrypts correctly
  - Different ciphertexts for same plaintext (random IV)
  - Rejects tampered ciphertext (auth tag verification)
  - Rejects wrong key

- **CredentialTypeDefinition:**
  - Validates required fields present
  - Validates field types
  - Rejects unknown fields

- **IntegrationRegistry:**
  - Registers and retrieves credential types
  - Validates credential data against type

### Unit Tests (API)

- **CredentialsService:**
  - Creates credential with encrypted data
  - Returns credential without secrets
  - Updates credential (re-encrypts)
  - Deletes credential
  - Validates credential type exists

- **CredentialsController:**
  - CRUD endpoints work
  - Secrets never returned in responses
  - Validation rejects invalid input

### Integration Tests

- Create credential via API → verify encrypted in database
- Get credential via API → verify secrets are masked
- Update credential → verify re-encryption
- Delete credential → verify removed

## Verification Commands

```bash
# Run all tests
pnpm test

# Run workflow-core tests
cd packages/workflow-core && pnpm test

# Run API tests
cd apps/api && pnpm test

# Typecheck
pnpm typecheck

# Lint
pnpm lint
```

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Encryption key not set | Medium | High | Fail fast on startup if missing |
| Key rotation needed | Low | High | Design for future key versioning |
| Token expiry not handled | Medium | Medium | Store expiry in metadata, nodes check before use |
| Credential data schema changes | Low | Medium | Version credential types, migrate old data |

## Known Limitations

- No OAuth2 authorization flows (Phase 7)
- No automatic token refresh (nodes handle this themselves)
- No credential sharing between projects
- No audit logging of credential access
- No credential versioning

## Future Considerations

- **Phase 7:** Google OAuth2 flow will use this credential storage
- **Phase 5+ future:** Add more credential types (Slack, Discord, Stripe, etc.)
- **Phase 14:** Add audit logging for credential access
- **Key rotation:** Support multiple encryption keys for migration

## Files Changed

| File | Action |
|------|--------|
| `packages/workflow-core/src/credential-system/encryption.ts` | Created |
| `packages/workflow-core/src/credential-system/credential-types.ts` | Created |
| `packages/workflow-core/src/credential-system/integration-registry.ts` | Created |
| `packages/workflow-core/src/credential-system/index.ts` | Created |
| `packages/workflow-core/src/credential-system/*.spec.ts` | Created |
| `packages/workflow-core/src/node-system/interfaces.ts` | Modified (add resolveCredential) |
| `packages/workflow-core/src/executor.ts` | Modified (add CredentialResolver) |
| `packages/workflow-core/src/index.ts` | Modified (add exports) |
| `apps/api/prisma/schema.prisma` | Modified (add Credential model) |
| `apps/api/src/modules/credentials/` | Created (module, service, controller, DTOs) |
| `apps/api/src/modules/workflows/workflows.service.ts` | Modified (pass credentialResolver) |

## Completion Checklist

- [x] Plan approved by human
- [x] Prisma schema has Credential model
- [x] EncryptionService implemented and tested
- [x] CredentialTypeDefinition implemented
- [x] IntegrationRegistry implemented
- [x] NodeExecutionContext updated with resolveCredential
- [x] WorkflowExecutor updated with CredentialResolver
- [x] CredentialsModule created in API
- [x] CredentialsService implemented
- [x] CredentialsController implemented
- [x] DTOs created with validation
- [x] API endpoints work (CRUD)
- [x] Secrets never returned in API responses
- [x] Environment variable validation (ENCRYPTION_KEY)
- [x] Unit tests pass (100 in workflow-core, 62 in API)
- [x] `pnpm test` passes
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Documentation updated
