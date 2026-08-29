# Current Work

> **Last updated**: 2026-08-29 (projects module implemented)

## Active Task

**None** — Projects module is complete. No feature work is currently in progress.

## Session Context

If you are an AI agent starting a new session, this is what you need to know:

1. Phase 0 (Dev System), Phase 1 (Foundation), and Phase 2 (Projects) are complete.
2. Prisma 6.x is configured with PostgreSQL.
3. The Projects module is the first domain module and establishes the pattern.
4. The next step is to implement the Workflows module (Phase 3).

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

## Notes for Next Session

When a feature is started:
- Update this file to reflect the active task.
- Create a feature doc in `docs/features/`.
- Update `PROJECT-STATE.md` when the feature is complete.
- Add an entry to `CHANGELOG.md`.

## Source of Truth

The repository is the source of truth. This file is for convenience, not authority.
