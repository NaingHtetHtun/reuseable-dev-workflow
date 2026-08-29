# Current Work

> **Last updated**: 2026-08-29 (monorepo migration implemented)

## Active Task

**None** — Monorepo migration is complete. No feature work is currently in progress.

## Session Context

If you are an AI agent starting a new session, this is what you need to know:

1. Phases 0-4 are complete (Dev System, Foundation, Projects, Workflow Engine, Node System).
2. Monorepo migration is complete (pnpm workspaces + Turborepo).
3. The repository now has 3 packages:
   - `apps/api/` — NestJS backend
   - `apps/web/` — React frontend (scaffold)
   - `packages/workflow-core/` — Framework-independent workflow/node logic
4. All 113 tests pass (65 in workflow-core, 48 in API).
5. The next step is to implement the Credentials module (Phase 5).

## How to Resume Work

1. Read `AGENTS.md` (development contract).
2. Read `.ai/ROADMAP.md` (long-term direction).
3. Read `.ai/CONTINUE.md` (session handoff).
4. Read this file (`docs/state/CURRENT-WORK.md`).
5. Read `docs/state/PROJECT-STATE.md` (full project snapshot).
6. Read `docs/state/CHANGELOG.md` (what happened recently).
7. Read any feature docs in `docs/features/` that are marked IN PROGRESS.
8. Check `git status` and `git log` for current state.
9. Run `pnpm test` and `pnpm typecheck` to confirm everything works.
10. Then proceed with the next task or wait for human instructions.

## Blockers

None.

## Source of Truth

The repository is the source of truth. This file is for convenience, not authority.
