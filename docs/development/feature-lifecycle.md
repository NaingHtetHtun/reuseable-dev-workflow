# Feature Development Lifecycle

## Status: Established

## Overview

Every meaningful feature must follow this lifecycle:

```
PLAN → REVIEW → APPROVE → IMPLEMENT → TEST → PREVIEW → REVIEW → DOCUMENT → COMPLETE
```

## Phases

### Phase 1 — Understand
- Inspect existing architecture, documentation, skills, implementation, tests, and conventions.
- Read `AGENTS.md` and relevant skill files.

### Phase 2 — Research
- Research external libraries, APIs, and tools from official documentation.
- Verify current versions and compatibility.
- Record documentation references.

### Phase 3 — Plan
- Create or update a feature plan in `docs/features/NNN-feature-name.md`.
- The plan must cover: problem, goal, scope, non-goals, architecture, data model, API, security, dependencies, testing, preview, documentation, risks, alternatives.

### Phase 4 — Human Approval
- **STOP. Do not implement until the human explicitly approves the plan.**
- Approval must be explicit: "APPROVED" or equivalent.
- If rejected, revise the plan.

### Phase 5 — Implementation
- Implement ONLY the approved scope.
- Do not add unrelated improvements.
- Do not silently expand scope.
- If a new architectural decision becomes necessary, STOP and explain.

### Phase 6 — Testing
- Write tests during implementation, not only at end.
- Run `pnpm test`, `pnpm typecheck`, `pnpm lint`.

### Phase 7 — Preview
- Provide a practical way for the human to inspect/test.
- Local URL, API endpoint, test command, example request.

### Phase 8 — Final Review
- Verify: tests pass, typecheck passes, lint passes, no dead code, no unnecessary deps, no duplicated logic, docs updated.

### Phase 9 — Documentation
- Create or update feature documentation.
- Use the feature template.

## Anti-Patterns to Avoid

- **Prompt → Huge Code Dump → Hope It Works** — Never do this.
- Skipping the plan phase.
- Implementing before approval.
- Expanding scope during implementation.
- Claiming completion without verification.
