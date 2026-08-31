# Session Continuity System

## Status: Established

## Purpose

Ensure that every new AI coding session can recover full project context without relying on conversation history.

## How It Works

The system uses three state files as persistent memory:

### 1. `docs/state/PROJECT-STATE.md`

- **What it is**: Snapshot of the entire project's current state.
- **When updated**: When features are completed or project phase changes.
- **Contains**: Completed work, pending work, blockers, next task, architecture decisions.

### 2. `docs/state/CURRENT-WORK.md`

- **What it is**: Active work tracking for the current/last session.
- **When updated**: At start and end of each work session.
- **Contains**: Active task, session context, how to resume, blockers.

### 3. `docs/state/CHANGELOG.md`

- **What it is**: Chronological history of completed work.
- **When updated**: With each completed piece of work.
- **Contains**: Date, description, files changed, verification results.

## Session-Start Workflow

Every AI session MUST execute this before doing any work:

```
1. Read AGENTS.md                    → Understand rules
2. Read docs/state/PROJECT-STATE.md  → Understand project state
3. Read docs/state/CURRENT-WORK.md   → Understand active work
4. Read relevant feature docs        → Understand specific context
5. Read relevant ADRs                → Understand decisions
6. git status && git log             → Verify actual repo state
7. pnpm test && pnpm typecheck       → Verify everything works
8. Begin work or wait for instructions
```

## Session-End Workflow

Before ending a session, execute:

```
1. Summarize completed work
2. Record pending work
3. Record blockers
4. Record next recommended task
5. Update docs/state/CURRENT-WORK.md
6. Update docs/state/PROJECT-STATE.md
7. Add entry to docs/state/CHANGELOG.md
8. Update feature docs if applicable
```

## Source of Truth

**The repository is the source of truth.**

If `docs/state/` files conflict with reality:

- The repository wins.
- Update the documentation to match reality.
- Never claim work is completed when it has not been verified.

## Maintenance Rules

- Do not fabricate project history.
- Do not claim work is completed when only planned.
- Keep files concise and actionable.
- Update state files as part of the development workflow, not as an afterthought.

## Verification

After updating state files, verify consistency:

1. `PROJECT-STATE.md` matches `git log` and actual code.
2. `CURRENT-WORK.md` reflects actual active work.
3. `CHANGELOG.md` entries match actual commits.
4. Feature doc statuses match actual implementation.
