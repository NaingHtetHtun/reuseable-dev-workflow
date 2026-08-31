# Changelog

> Chronological record of completed work. Most recent entry first.

## 2026-08-31 — Preview System Implemented

**What**: Implemented the preview system — Swagger/OpenAPI integration, workflow preview with sandboxed execution, mock HTTP/delay handlers, and preview API endpoints.

**Files created/modified**:
- `packages/workflow-core/src/preview-system/` — PreviewExecutor, PreviewTypes, NodeMockRegistry
- `apps/api/src/modules/preview/` — NestJS PreviewModule, service, controller, DTOs
- `apps/api/src/main.ts` — Swagger/OpenAPI setup
- `apps/api/jest.config.ts` — Updated transformIgnorePatterns for @nestjs/swagger
- Added `@nestjs/swagger@^7.4.2` dependency

**Key design decisions**:
- Framework-independent preview logic in workflow-core
- Mock HTTP requests by default in preview (opt-in for real requests)
- Mock delays by default in preview (opt-in for real execution)
- Swagger UI at `/api/docs`
- Validation, dry-run, execute, and step-through preview modes
- @nestjs/swagger v7 (CJS compatible with Jest)

**Verification**:
- `pnpm typecheck` — passes
- `pnpm lint` — passes
- `pnpm format` — passes
- Workflow-core: 278 tests passing
- API: 114 tests passing
- Total: 392 tests

---

## 2026-08-31 — Workflow Triggers Implemented

**What**: Implemented the trigger system — framework-independent trigger abstraction with manual, webhook, and scheduled trigger types. Added HMAC webhook validation, idempotency, and API endpoints.

**Files created/modified**:
- `packages/workflow-core/src/trigger-system/` — TriggerTypeDefinition, TriggerHandler interfaces, TriggerTypeRegistry, TriggerExecutor
- `packages/workflow-core/src/trigger-system/triggers/` — ManualTriggerHandler, WebhookTriggerHandler, ScheduledTriggerHandler
- `apps/api/src/modules/triggers/` — NestJS TriggersModule, service, controller
- `apps/api/src/modules/webhooks/` — NestJS WebhooksModule, service, controller
- `apps/api/src/modules/workflows/workflows.module.ts` — Added WorkflowsService export
- Fixed lint errors (unused imports) in trigger-test and webhook files

**Key design decisions**:
- Framework-independent trigger interface (reusable by code generator)
- Registry-based (new trigger types without modifying core)
- HMAC-SHA256 webhook signature validation
- In-memory idempotency (5-minute deduplication window)
- Triggers stored as part of workflow definition (versioned with workflow)
- External scheduler for cron (not built into platform)

**Verification**:
- `pnpm test` — 354 tests passing (256 in workflow-core, 97 in API)
- `pnpm typecheck` — passes
- `pnpm lint` — passes
- `pnpm format` — passes

---

## 2026-08-29 — OAuth / Authentication Integrations Implemented

**What**: Implemented framework-independent OAuth provider abstraction with Google as first implementation. Added PKCE support, state parameter CSRF protection, token management, and API endpoints.

**Files created/modified**:

- `packages/workflow-core/src/oauth-system/` — OAuth provider interface, registry, PKCE helper, state manager, token manager
- `packages/workflow-core/src/oauth-system/providers/google-oauth.provider.ts` — Google OAuth implementation
- `packages/workflow-core/src/oauth-system/*.spec.ts` — 50 new tests
- `apps/api/src/modules/oauth/` — NestJS OAuth module, service, controller, DTOs
- `apps/api/src/modules/oauth/*.spec.ts` — 3 new tests

**Key design decisions**:

- Framework-independent OAuth interface (reusable by code generator)
- PKCE (S256) for providers that support it (Google does)
- HMAC-SHA256 signed state tokens for CSRF protection
- OAuth tokens stored via existing credential system (Phase 5)
- On-demand token refresh (no background jobs)
- OpenID Connect designed for future extension (not implemented now)

**Verification**:

- `pnpm test` — 221 tests passing (150 in workflow-core, 71 in API)
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## 2026-08-29 — Credentials / Integrations Implemented

**What**: Implemented secure credential storage with AES-256-GCM encryption. Added credential types, integration registry, and node execution context with `resolveCredential`.

**Files created/modified**:

- `packages/workflow-core/src/credential-system/` — Encryption, credential types, integration registry
- `packages/workflow-core/src/node-system/interfaces.ts` — Added `resolveCredential` to `NodeExecutionContext`
- `packages/workflow-core/src/executor.ts` — Added `CredentialResolver` type
- `apps/api/prisma/schema.prisma` — Added `Credential` model
- `apps/api/src/modules/credentials/` — NestJS module, service, controller, DTOs
- `apps/api/.env.example` — Added `ENCRYPTION_KEY`

**Key design decisions**:

- AES-256-GCM encryption (Node.js built-in, no dependencies)
- Credentials scoped to projects
- 6 built-in credential types (api-key, bearer-token, basic-auth, google-oauth2, github-token, smtp)
- Secrets NEVER returned in API responses
- `resolveCredential(id)` in node execution context
- Framework-independent credential system in workflow-core

**Verification**:

- `pnpm test` — 162 tests passing (100 in workflow-core, 62 in API)
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## 2026-08-29 — Monorepo Migration Implemented

**What**: Converted single-package repository to pnpm workspaces + Turborepo monorepo. Extracted framework-independent workflow/node logic into `@devflow/workflow-core`. Scaffolded React frontend with Vite.

**Files created/modified**:

- `pnpm-workspace.yaml` — Workspace configuration
- `turbo.json` — Turborepo build orchestration
- `package.json` — Root workspace package
- `apps/api/` — NestJS backend (moved from root)
- `apps/web/` — React frontend (Vite scaffold)
- `packages/workflow-core/` — Framework-independent workflow/node logic
- `docs/features/005-monorepo-migration.md` — Migration plan

**Key design decisions**:

- Turborepo for build orchestration (lightweight, standard)
- Vite + React for frontend (fast, modern)
- Vitest for workflow-core tests (native ESM)
- Jest for API tests (NestJS ecosystem)
- Abstract Logger interface in workflow-core (replaces NestJS Logger)
- Zero runtime dependencies in workflow-core

**Verification**:

- `pnpm test` — 113 tests passing (65 in workflow-core, 48 in API)
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## 2026-08-29 — Node System Implemented

**What**: Implemented the node type system — framework-independent node interfaces, registry, validator, and 5 built-in nodes. Refactored workflow executor to use registry.

**Files created/modified**:

- `src/modules/workflows/engine/node-system/` — Full node system (18 files)
- `src/modules/workflows/engine/workflow-executor.ts` — Refactored to use registry
- `src/modules/workflows/workflows.service.ts` — Updated for async executor

**Key design decisions**:

- Framework-independent interfaces (no NestJS/Prisma)
- NodeRegistry for pluggable node types
- Schema-driven parameter validation
- 5 built-in nodes: log, set-variable, no-op, http-request, delay

**Verification**:

- `pnpm test` — 96 tests passing (16 suites)
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## 2026-08-29 — Workflow Engine Implemented

**What**: Implemented the workflow engine — definition format, validation, execution, and CRUD API.

**Verification**:

- `pnpm test` — 65 tests passing
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## 2026-08-29 — Projects Module Implemented

**What**: Implemented the Projects module — first domain module with full CRUD API.

**Verification**:

- `pnpm test` — 28 tests passing
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## 2026-08-29 — AI Roadmap and Session Handoff System

**What**: Created `.ai/ROADMAP.md` and `.ai/CONTINUE.md`.

**Verification**: Documentation only.

---

## 2026-08-29 — Project Foundation Implemented

**What**: Implemented core project foundation: Prisma ORM, configuration, logging, error handling, health checks.

**Verification**:

- `pnpm test` — 5 tests passing
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## 2026-08-29 — Session Continuity System Added

**What**: Added persistent project memory and session continuity system.

**Verification**: Documentation only.

---

## 2026-08-29 — Project Bootstrap Complete

**What**: Established the complete development system for DevFlow Platform.

**Verification**:

- `pnpm test` — 1 test passing
- `pnpm typecheck` — passes
- `pnpm lint` — passes

---

## Template for Future Entries

```
## YYYY-MM-DD — Short Description

**What**: Brief summary of what was done.

**Files created/modified**:
- List of files

**Verification**:
- How it was verified
```
