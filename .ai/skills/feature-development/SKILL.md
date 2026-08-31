# Feature Development Skill

## Purpose

Implement features following the full development lifecycle with proper planning and approval.

## When to Use

- Implementing any new feature
- Adding new functionality to existing modules
- Creating new API endpoints
- Adding new services

## Required Behavior

1. **Understand** — Read existing architecture, docs, skills, code, and tests.
2. **Research** — Research external libraries/APIs from official docs.
3. **Plan** — Create a feature plan in `docs/features/NNN-feature-name.md`.
4. **STOP for approval** — Do not implement until human approves.
5. **Implement** — Only the approved scope.
6. **Test** — Write tests during implementation.
7. **Preview** — Provide a way for human to verify.
8. **Review** — Run typecheck, lint, format.
9. **Document** — Update feature documentation.

## Things to Inspect

- `docs/features/` for existing feature docs
- Existing tests
- Existing services in the same domain
- Package.json for existing dependencies

## Things to Avoid

- Skipping the plan phase
- Implementing before approval
- Expanding scope beyond approved plan
- Adding unrelated improvements
- Declaring completion without verification

## Verification Checklist

- [ ] Plan created and approved
- [ ] Implementation matches plan
- [ ] Tests written and passing
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Format passes
- [ ] Documentation updated
- [ ] Preview provided
