# Code Quality Skill

## Purpose
Maintain high code quality through consistent conventions.

## When to Use
- Writing any code
- Reviewing code
- Refactoring existing code

## Required Behavior
1. Small files, small classes, small functions.
2. Clear, descriptive naming.
3. Single responsibility per class/function/module.
4. No duplicated logic — extract when pattern repeats.
5. No dead code — remove immediately.
6. No unused imports.
7. No unnecessary abstractions.
8. No magic values — use constants or config.
9. No giant controllers — extract services.
10. No business logic inside controllers.
11. No giant service classes — split responsibilities.

## Things to Inspect
- File length (warn if >300 lines)
- Class responsibilities
- Function length
- Import statements
- Duplicated code patterns

## Things to Avoid
- Artificial file splitting just to reduce line count
- Over-abstraction
- Premature optimization
- Clever code that sacrifices readability

## Verification Checklist
- [ ] Files are reasonably sized
- [ ] Functions do one thing
- [ ] No dead code
- [ ] No unused imports
- [ ] Clear naming
- [ ] `pnpm lint` passes
- [ ] `pnpm format` passes
