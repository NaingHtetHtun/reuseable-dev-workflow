# Documentation Skill

## Purpose

Write clear, useful documentation that stays synchronized with code.

## When to Use

- Creating feature documentation
- Updating architecture docs
- Writing API documentation
- Documenting decisions

## Required Behavior

1. Every meaningful feature gets a doc in `docs/features/`.
2. Use the feature template: `docs/features/_template.md`.
3. Distinguish status: Planned, In Progress, Implemented, Future.
4. No imaginary implementations documented as existing.
5. Keep docs synchronized with code changes.
6. Record architectural decisions in `docs/decisions/`.

## Things to Inspect

- `docs/features/_template.md` for format
- Existing feature docs
- Architecture docs in `docs/architecture/`

## Things to Avoid

- Huge meaningless documentation
- Documentation that contradicts code
- Missing status indicators
- Claiming features are implemented when only planned
- Duplicating information across docs

## Verification Checklist

- [ ] Uses standard template format
- [ ] Status is accurate
- [ ] Matches actual implementation
- [ ] No contradictions with code
- [ ] Cross-references are valid
