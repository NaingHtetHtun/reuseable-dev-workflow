# Code Generation Skill

## Purpose
Guide future code generation architecture (planned, not implemented).

## When to Use
- Designing the compiler/code generation system
- Adding new framework targets
- Implementing template-based generation

## Status: PLANNED — Not Yet Implemented

## Future Architecture
```
Application Definition
  → Framework Compiler
    → Framework Version Adapter
      → Templates / AST / Generators
        → Generated Project
```

## Principles
1. Core domain must NOT depend on framework implementation details.
2. Framework-specific code isolated in adapters.
3. Internal representation is framework-independent.
4. Each target framework has its own adapter.
5. Templates are testable in isolation.

## Future Targets
- Laravel
- NestJS
- Other frameworks later

## Things to Inspect (when implementing)
- Internal application definition format
- Framework adapter interface
- Template syntax and patterns
- Generated code quality

## Things to Avoid
- Spreading framework assumptions through core domain
- Tight coupling between generation targets
- Untested template output
- Generating code with hardcoded paths or assumptions

## Verification Checklist
- [ ] Internal representation framework-independent
- [ ] Adapter isolates framework specifics
- [ ] Generated code compiles
- [ ] Generated code passes framework linting
- [ ] Templates are testable
