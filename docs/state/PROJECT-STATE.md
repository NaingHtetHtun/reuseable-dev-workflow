# Project State

> **Last updated**: 2026-09-01 (Phase 8 Resource/CRUD Builder implemented)

## Completed

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

## In Progress

None.

## Pending

| Priority | Task                      | Phase    |
| -------- | ------------------------- | -------- |
| Next     | Code generation engine    | Phase 10 |
| After    | Laravel Generator         | Phase 11 |
| Later    | NestJS Generator          | Phase 12 |

## Key Metrics

- **Test suites**: 30 in workflow-core, 21 in API, 1 in web
- **Total tests**: 557 (375 in workflow-core, 181 in API, 1 in web)
- **Packages**: 3 (api, web, workflow-core)

## Monorepo Structure

```
apps/
├── api/        # NestJS backend (181 tests)
└── web/        # React frontend (1 test)

packages/
└── workflow-core/  # Framework-independent workflow/node/credential/oauth/trigger/preview/component/resource logic (375 tests)
```

## Source of Truth

The repository is the source of truth. This file is for convenience, not authority.
