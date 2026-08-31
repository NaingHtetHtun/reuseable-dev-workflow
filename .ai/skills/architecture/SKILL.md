# Architecture Skill

## Purpose

Guide architectural decisions, module boundaries, and system design.

## When to Use

- Designing new modules or services
- Deciding module boundaries
- Evaluating circular dependency risks
- Refactoring module structure
- Reviewing architectural proposals

## Required Behavior

1. Inspect existing module structure before proposing changes.
2. Follow the 8 architecture principles in AGENTS.md.
3. Ensure no circular dependencies between major modules.
4. Prefer composition over inheritance.
5. Keep framework-specific code isolated.
6. Separate API, domain, infrastructure, and persistence concerns.

## Things to Inspect

- Existing module boundaries
- Import paths between modules
- NestJS module declarations
- Service responsibilities
- Controller responsibilities

## Things to Avoid

- Giant modules with many services
- Circular imports
- Business logic in controllers
- Framework-specific code in domain logic
- Premature abstraction layers

## Verification Checklist

- [ ] No circular dependencies
- [ ] Single responsibility per module
- [ ] Clear API boundaries
- [ ] Framework code isolated
- [ ] Services are composable
