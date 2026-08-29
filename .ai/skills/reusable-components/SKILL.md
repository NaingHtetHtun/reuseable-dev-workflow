# Reusable Components Skill

## Purpose
Guide future reusable development component architecture (planned, not implemented).

## When to Use
- Designing a new reusable component
- Implementing component definition format
- Adding framework generators for components

## Status: PLANNED — Not Yet Implemented

## Component Structure (Future)
Each reusable component should eventually contain:
- **Definition**: what it does, inputs, outputs
- **Configuration**: user-configurable options
- **Credential schema**: what credentials it needs
- **Runtime implementation**: runs inside platform
- **Preview behavior**: how to preview it
- **Tests**: unit and integration tests
- **Framework generators**: Laravel, NestJS, etc.

## Example Components (Future)
- Google Login
- Apple Login
- Email Login
- User CRUD
- Category CRUD
- File Upload
- Email sending
- Notifications
- Roles & Permissions
- Common API patterns

## Principles
1. Components are not project-specific.
2. Same component runs in platform AND generates code.
3. Framework generators are separate from runtime.
4. Components are independently testable.
5. Configuration is explicit and validated.

## Things to Inspect (when implementing)
- Component definition format
- Configuration schema
- Credential requirements
- Runtime interface
- Generator interface

## Things to Avoid
- Tight coupling to specific projects
- Assuming one implementation for runtime and generation
- Missing credential validation
- Untested generated code
- Implicit configuration

## Verification Checklist
- [ ] Component is project-independent
- [ ] Runtime works in platform
- [ ] Generators produce valid code
- [ ] Component is independently testable
- [ ] Configuration is validated
