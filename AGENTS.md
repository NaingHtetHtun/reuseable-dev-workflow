# AGENTS.md — Development Contract

## Project Overview

DevFlow Platform — a developer-focused visual application/workflow platform for building reusable development components, workflow automation, and framework-aware code generation.

## Product Philosophy

Developers repeatedly build the same foundation (auth, CRUD, validation, etc.). This platform enables building those components once and reusing them across projects, reducing repetitive AI coding work so developers focus on unique business logic.

## Architecture Principles

1. **Modular architecture** — no giant modules or services.
2. **Separation of concerns** — API, domain logic, infrastructure, runtime, compilation, presentation, persistence are separate.
3. **Reusable components** — not coupled to one project.
4. **Runtime vs Generator separation** — platform execution and code generation are distinct.
5. **Framework-specific isolation** — framework code is isolated, not spread through core.
6. **Stable internal representation** — framework-independent definitions (future).
7. **Explicit boundaries** — no circular dependencies between major modules.
8. **Prefer composition** — small composable services over huge classes.

## Tech Stack

- NestJS (backend framework)
- TypeScript (strict mode)
- pnpm (package manager)
- Jest (testing)

## Development Lifecycle

Every feature MUST follow:

```
PLAN → REVIEW → APPROVE → IMPLEMENT → TEST → PREVIEW → REVIEW → DOCUMENT → COMPLETE
```

### Phase 1 — Understand
Inspect existing architecture, documentation, skills, implementation, tests, and conventions.

### Phase 2 — Research
Research official documentation for external libraries/APIs. Verify current versions.

### Phase 3 — Plan
Create/update a feature plan covering: problem, goal, scope, non-goals, architecture, data model, API, security, dependencies, testing, preview, risks, alternatives.

### Phase 4 — Human Approval
**STOP. Do not implement until the human explicitly approves the plan.**

### Phase 5 — Implementation
Implement ONLY the approved scope. Do not add unrelated improvements.

### Phase 6 — Testing
Write and execute tests during implementation.

### Phase 7 — Preview
Provide a practical way for the human to inspect/test the feature.

### Phase 8 — Final Review
Verify: tests pass, typecheck passes, lint passes, formatting passes, no dead code, no unnecessary deps, no duplicated logic, docs updated.

### Phase 9 — Documentation
Create or update dedicated feature documentation.

## Approval Requirements

- **DO NOT CODE BEFORE PLAN APPROVAL.**
- Plans must be explicitly approved by the human developer.
- If architectural decisions arise during implementation, STOP and explain.
- Do not silently expand scope.

## Testing Requirements

- Unit tests required for all business logic.
- Integration tests for API endpoints.
- Tests written during implementation, not only at end.
- A feature is NOT complete merely because code compiles.

## Dependency Requirements

Before installing any package:
1. Explain why it is needed.
2. Search project for existing equivalent.
3. Research official docs.
4. Verify compatibility.
5. Check security and license.
6. Include in feature plan.
7. Wait for human approval if it materially affects architecture.

**Do not install packages simply because they are convenient.**

## Documentation Requirements

- Every meaningful feature gets a dedicated Markdown file in `docs/features/`.
- No imaginary implementations documented as existing.
- Distinguish: Planned, In Progress, Implemented, Future.
- Docs stay synchronized with code.

## Code Quality Rules

- Small files, small classes, small functions.
- Clear naming, single responsibility.
- No duplicated logic, dead code, unused imports.
- No unnecessary abstractions or magic values.
- No giant controllers or service classes.
- No business logic inside controllers.

## Security Rules

- Never hard-code secrets into source code.
- Never commit real credentials.
- Never print secrets in logs.
- Credential storage is a first-class security subsystem.
- User input must be validated.

## Git / Change Discipline

- A feature should be logically isolated.
- Do not mix: feature implementation, large refactors, dependency upgrades, formatting in one change (unless explicitly required).
- Before completion, inspect changed files for unrelated modifications.

## AI Behavior Rules

The AI **must**:
- Read project instructions first.
- Read relevant skills before implementing.
- Inspect existing code before changing it.
- Never assume a feature doesn't exist.
- Never duplicate existing functionality.
- Ask for clarification when requirements are ambiguous.
- Stop when approval is required.
- Avoid scope creep.
- Explain architectural tradeoffs.
- Test its work.
- Fix failures before declaring completion.
- Keep documentation synchronized.

The AI **must NOT**:
- Rewrite the entire project unnecessarily.
- Replace working architecture without approval.
- Add dependencies casually.
- Generate huge files.
- Hide errors.
- Skip tests.
- Claim something works without verification.
- Claim a feature is implemented when only planned.
- Modify unrelated files.

## Definition of Done

A feature is DONE when:
- [ ] Plan was approved by human
- [ ] Implementation matches approved scope
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if applicable)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Formatting passes (`pnpm format`)
- [ ] No unnecessary dependencies added
- [ ] No dead code introduced
- [ ] No duplicated logic introduced
- [ ] Feature documentation created/updated
- [ ] Preview provided for human review
- [ ] Human reviewed and accepted

## Files to Reference

- `.ai/skills/` — Engineering discipline skills
- `.ai/prompts/` — Feature and workflow prompts
- `docs/` — All project documentation
- `docs/features/` — Feature documentation and templates
