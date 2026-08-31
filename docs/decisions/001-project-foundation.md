# ADR-001: Project Foundation

## Status: Accepted

## Context

We are starting a new developer-focused visual application/workflow platform. We need to establish the initial technology choices and project structure.

## Decision

- Use NestJS as the backend framework
- Use TypeScript with strict mode
- Use pnpm as the package manager
- Use Jest for testing
- Use ESLint + Prettier for code quality
- Start with a minimal NestJS application skeleton

## Rationale

- NestJS provides a modular architecture that aligns with our principle of separation of concerns.
- TypeScript strict mode enforces type safety from the start.
- pnpm is efficient and handles monorepos well for future growth.
- Jest is the standard for NestJS projects and has good TypeScript support.
- ESLint + Prettier ensures consistent code quality.

## Consequences

- We have a working NestJS application with a health endpoint.
- We have a development toolchain ready for feature development.
- We have a clear foundation for adding modules as features are implemented.

## Related

- `docs/architecture/overview.md`
- `docs/architecture/principles.md`
