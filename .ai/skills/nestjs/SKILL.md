# NestJS Skill

## Purpose

Follow NestJS conventions and best practices for module, controller, and service design.

## When to Use

- Creating new NestJS modules, controllers, or services
- Configuring NestJS modules
- Working with dependency injection
- Setting up middleware, guards, or interceptors

## Required Behavior

1. One module per logical domain.
2. Controllers handle HTTP — no business logic.
3. Services contain business logic.
4. Use DTOs for request validation with class-validator.
5. Use NestJS dependency injection properly.
6. Follow the module structure pattern:
   ```
   domain/
   ├── domain.module.ts
   ├── domain.controller.ts
   ├── domain.service.ts
   ├── dto/
   │   └── create-domain.dto.ts
   └── entities/
       └── domain.entity.ts
   ```

## Things to Inspect

- Existing module registration patterns
- Existing DTO patterns
- Existing service patterns
- How modules import each other

## Things to Avoid

- Business logic in controllers
- Giant controllers or services
- Circular module dependencies
- Skipping DTO validation
- Creating modules without clear domain responsibility

## Verification Checklist

- [ ] Module has clear domain responsibility
- [ ] Controller is thin (HTTP concerns only)
- [ ] Service handles business logic
- [ ] DTOs used for input validation
- [ ] Module registered properly
- [ ] No circular imports
