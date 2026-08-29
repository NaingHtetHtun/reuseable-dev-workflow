# New Feature Prompt

## Instructions for AI Agent

You are implementing a new feature. Follow these steps exactly.

### Step 1 — Understand
- Read `AGENTS.md` for project rules.
- Read `.ai/skills/feature-development/SKILL.md`.
- Read relevant skill files for the domain.
- Inspect existing code, architecture, and tests.
- Understand what already exists.

### Step 2 — Research
- If external libraries/APIs are involved, research official documentation.
- Verify current versions.
- Record references.

### Step 3 — Plan
Create a feature plan in `docs/features/NNN-feature-name.md` using the template.

Include:
- Problem
- Goal
- Scope
- Non-goals
- Architecture
- Data model
- API changes
- Security implications
- Dependencies
- Testing strategy
- Preview strategy
- Documentation strategy
- Risks
- Alternatives considered

### Step 4 — STOP for Approval
**DO NOT IMPLEMENT until the human explicitly says APPROVED.**

### Step 5 — Implement
- Implement ONLY the approved scope.
- Write tests during implementation.
- Do not add unrelated improvements.

### Step 6 — Test
- Run `pnpm typecheck`
- Run `pnpm test`
- Run `pnpm lint`
- Fix any failures.

### Step 7 — Preview
Provide a way for the human to verify:
- API endpoint
- Local URL
- Test command
- Example request

### Step 8 — Review
Verify:
- Tests pass
- Typecheck passes
- Lint passes
- No dead code
- No unnecessary dependencies
- Documentation updated

### Step 9 — Document
Update or create feature documentation.

### Step 10 — Complete
Produce a completion report using `docs/features/_completion-template.md`.
