# Architecture Principles

## Status: Established

## Principle 1 — Modular Architecture
Avoid giant modules and giant services. Each module should have a clear, focused responsibility. Split functionality across modules when responsibilities grow unrelated.

## Principle 2 — Separation of Concerns
Separate API, domain logic, infrastructure, runtime, compilation, presentation, and persistence where appropriate. Controllers handle HTTP. Services handle business logic. Infrastructure handles external systems.

## Principle 3 — Reusable Components
A reusable component should not be tightly coupled to one specific project. It should be configurable and portable across projects.

## Principle 4 — Runtime vs Generator Separation
Runtime implementation (executing inside the platform) and code generation implementation (producing framework code) must be separate concerns. A component that runs in the platform is not automatically the same implementation that generates Laravel or NestJS code.

## Principle 5 — Framework-Specific Isolation
Framework-specific code should be isolated. Do not spread Laravel-specific assumptions throughout the core domain. Do not spread NestJS-specific assumptions through the code generation layer.

## Principle 6 — Stable Internal Representation
The platform should have a framework-independent internal representation for application/workflow definitions. This ensures the same definition can target multiple frameworks without core changes.

## Principle 7 — Explicit Boundaries
Avoid circular dependencies between major modules. Dependencies should flow in one direction. Use interfaces to decouple modules when needed.

## Principle 8 — Prefer Composition
Prefer small composable services/components over huge classes. Build complex behavior by combining simple, focused pieces.

## Enforcement

These principles are enforced through:
- Code review (AI and human)
- Architecture review for new modules
- Skill files in `.ai/skills/`
- The feature development lifecycle
