# Changelog

> Chronological record of completed work. Most recent entry first.

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
