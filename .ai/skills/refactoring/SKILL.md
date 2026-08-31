# Refactoring Skill

## Purpose

Refactor code safely without introducing regressions.

## When to Use

- Improving existing code structure
- Extracting services or modules
- Reducing complexity
- Eliminating duplication

## Required Behavior

1. Ensure tests exist before refactoring.
2. Refactor in small, verifiable steps.
3. Run tests after each step.
4. Do not change behavior during refactoring.
5. Do not mix refactoring with feature changes.
6. Document what changed and why.

## Things to Inspect

- Existing tests
- Existing patterns in the codebase
- What the code does (not just how)

## Things to Avoid

- Large-scale rewrites without tests
- Changing behavior while refactoring
- Mixing refactoring with features
- Refactoring code you don't understand
- Refactoring without a clear goal

## Verification Checklist

- [ ] Tests exist and pass before starting
- [ ] Tests pass after each step
- [ ] No behavior change
- [ ] No new features mixed in
- [ ] Code is measurably improved
