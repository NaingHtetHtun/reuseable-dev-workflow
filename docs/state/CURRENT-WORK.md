# Current Work

> **Last updated**: 2026-08-29 (OAuth module implemented)

## Active Task

**009-preview-system** — IMPLEMENTED and verified.

Phase 9 — Preview System complete. Next: Phase 6 (Reusable Component System).

## Session Context

If you are an AI agent starting a new session, this is what you need to know:

1. Phases 0-5, 7, 7b, and 9 are complete (Dev System, Foundation, Projects, Workflow Engine, Node System, Credentials, OAuth, Triggers, Preview).
2. The OAuth module provides a framework-independent provider abstraction with Google as first implementation.
3. PKCE is supported for providers that implement it (Google does).
4. State parameter with HMAC-SHA256 provides CSRF protection.
5. OAuth tokens are stored via the existing credential system (Phase 5).
6. The trigger system provides manual, webhook, and scheduled trigger types with HMAC validation and idempotency.
7. The preview system provides Swagger/OpenAPI docs, workflow preview with mock HTTP/delay handlers, and sandboxed execution.
8. The next step is to implement the Reusable Component System (Phase 6).

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
