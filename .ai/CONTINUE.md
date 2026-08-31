# Session Handoff

> **Purpose**: Allow a fresh AI session to immediately understand where development stopped and what to do next.
>
> **Rule**: Never invent progress. Never mark unfinished work as complete.
>
> **Last updated**: 2026-09-01

---

## Current State

| Field               | Value                                                     |
| ------------------- | --------------------------------------------------------- |
| **Current phase**   | Phase 11 — Laravel Generator                              |
| **Current feature** | 012-code-generation-engine.md (IMPLEMENTED)               |
| **Current status**  | Phase 10 Code Generation Engine complete. Next: Phase 11. |

---

## Completed Work

- [x] Phase 0 — Development System (AGENTS.md, skills, prompts, docs)
- [x] Phase 1 — Platform Foundation (Prisma, config, logging, error handling, health)
- [x] Phase 2 — Projects Module (CRUD API, pagination, search)
- [x] Phase 3 — Workflow Engine (definition format, validation, execution, history)
- [x] Phase 4 — Node System (registry, validator, 5 built-in nodes)
- [x] Monorepo Migration (pnpm workspaces, Turborepo, workflow-core extraction, React scaffold)
- [x] Phase 5 — Credentials / Integrations (encrypted storage, credential types, node integration)
- [x] Phase 6 — Reusable Component System (definition format, registry, validator, CRUD API, versioning, cloning)
- [x] Phase 7 — OAuth / Authentication Integrations (provider abstraction, PKCE, Google OAuth)
- [x] Phase 7b — Workflow Triggers (trigger abstraction, manual/webhook/scheduled, HMAC, idempotency)
- [x] Phase 8 — Resource / CRUD Builder (resource definitions, field types, Prisma generator, validation generator, CRUD API, versioning)
- [x] Phase 9 — Preview System (Swagger/OpenAPI, workflow preview, mock registry, sandboxed execution)
- [x] Phase 10 — Code Generation Engine (compiler pipeline, template engine, TypeScript adapter, API preview)

---

## Work In Progress

None.

---

## Pending Work

| Priority | Task              | Phase    |
| -------- | ----------------- | -------- |
| Next     | Laravel Generator | Phase 11 |
| After    | NestJS Generator  | Phase 12 |

---

## Blockers

None.

---

## Important Decisions

| Decision                    | Rationale                                     |
| --------------------------- | --------------------------------------------- |
| PKCE implemented now        | OAuth 2.1 requires it for all auth code flows |
| HMAC-signed state tokens    | CSRF protection without external dependencies |
| Components project-scoped   | Can be made global later                      |
| Resources use PascalCase    | Distinguishes from field names (snake_case)   |
| Resource generation preview | Inspect output before committing              |
| TypeScript adapter first    | Proves pipeline, useful standalone            |
| Custom template engine      | Zero dependencies, simple syntax              |
| Pluggable FrameworkAdapter  | Add frameworks by implementing interface      |

---

## Monorepo Structure

```
apps/
├── api/        # NestJS backend (192 tests)
└── web/        # React frontend (1 test)

packages/
└── workflow-core/  # Framework-independent workflow/node/credential/oauth/trigger/preview/component/resource/codegen logic (416 tests)
```

---

## Tests Status

```bash
# From root
pnpm test       # 609 tests passing ✅
pnpm typecheck  # passes ✅
pnpm lint       # passes ✅
pnpm format     # passes ✅

# From packages/workflow-core
npx vitest run  # 416 tests passing ✅

# From apps/api
ENCRYPTION_KEY=<64-char-hex> npx jest  # 192 tests passing ✅

# Total: 609 tests
```

---

## Exact Next Steps

1. Start Phase 11 (Laravel Generator) — create feature plan in `docs/features/013-laravel-generator.md`.
2. Follow the development lifecycle: PLAN → APPROVE → IMPLEMENT → TEST.
3. The Laravel generator will implement a FrameworkAdapter for Laravel v12.

---

## Instructions for Next AI Agent

- **Do not skip the session-start workflow** in AGENTS.md.
- **Do not assume work is completed** without verifying against the repository and tests.
- **Do not implement anything** without a plan and human approval.
- **Trust the repository**, not this file, if there's a conflict.
- **Update this file** when meaningful work is completed or interrupted.
- **Run from the correct directory** — tests are in `apps/api` and `packages/workflow-core`.
- **Set ENCRYPTION_KEY** (64-char hex) when running API tests directly.
- **Run `npx prisma generate`** after changing the Prisma schema.
- **Rebuild workflow-core** (`pnpm build`) after changing exports.
