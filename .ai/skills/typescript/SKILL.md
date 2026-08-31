# TypeScript Skill

## Purpose

Write clean, type-safe TypeScript following project conventions.

## When to Use

- Writing any TypeScript code
- Defining interfaces and types
- Working with generics
- Type casting or assertions

## Required Behavior

1. Strict mode is enabled — respect it.
2. Use `interface` for object shapes, `type` for unions/intersections.
3. Prefer `unknown` over `any`. If `any` is needed, document why.
4. Use explicit return types on exported functions.
5. Use `readonly` for immutable data.
6. Avoid type assertions (`as`) unless absolutely necessary.
7. Use discriminated unions for state management.

## Things to Inspect

- `tsconfig.json` for compiler settings
- Existing type patterns in the codebase
- Existing DTO patterns

## Things to Avoid

- `any` type (warn-level rule)
- Unused imports or variables
- Implicit `any` parameters
- Magic values — use constants or config
- Overly complex type gymnastics

## Verification Checklist

- [ ] No `any` types without documented reason
- [ ] Explicit return types on exported functions
- [ ] Unused variables removed
- [ ] Types are clear and self-documenting
- [ ] Strict mode respected
