# Project State

> **Last updated**: 2026-08-29 (OAuth module implemented)

## Completed

- [x] Phase 0 — Development System (AGENTS.md, skills, prompts, docs)
- [x] Phase 1 — Platform Foundation (Prisma, config, logging, error handling, health)
- [x] Phase 2 — Projects Module (CRUD API, pagination, search)
- [x] Phase 3 — Workflow Engine (definition format, validation, execution, history)
- [x] Phase 4 — Node System (registry, validator, 5 built-in nodes)
- [x] Monorepo Migration (pnpm workspaces, Turborepo, workflow-core extraction, React scaffold)
- [x] Phase 5 — Credentials / Integrations (encrypted storage, credential types, node integration)
- [x] Phase 7 — OAuth / Authentication Integrations (provider abstraction, PKCE, Google OAuth)
- [x] Phase 7b — Workflow Triggers (trigger abstraction, manual/webhook/scheduled, HMAC, idempotency)

## In Progress

None.

## Pending

| Priority | Task                      | Phase    |
| -------- | ------------------------- | -------- |
| Next     | Reusable component system | Phase 6  |
| After    | Resource / CRUD Builder   | Phase 8  |
| Later    | Preview system            | Phase 9  |
| Later    | Code generation engine    | Phase 10 |

## Key Metrics

- **Test suites**: 24 (23 in workflow-core, 15 in API)
- **Total tests**: 354 (256 in workflow-core, 97 in API)
- **Packages**: 3 (api, web, workflow-core)

## Monorepo Structure

```
apps/
├── api/        # NestJS backend (97 tests)
└── web/        # React frontend (scaffold)

packages/
└── workflow-core/  # Framework-independent workflow/node/credential/oauth/trigger logic (256 tests)
```

## Source of Truth

The repository is the source of truth. This file is for convenience, not authority.
