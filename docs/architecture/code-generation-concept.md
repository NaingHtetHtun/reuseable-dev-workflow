# Code Generation Concept

## Status: PLANNED — Not Yet Implemented

## Flow

```
Application Definition (framework-independent)
  → Framework Compiler
    → Framework Version Adapter
      → Templates / AST / Generators
        → Generated Project
```

## Key Principles

1. **Framework-independent core**: The core domain must NOT depend on Laravel or any specific framework implementation details.
2. **Isolated adapters**: Each target framework has its own adapter that translates the internal representation to framework-specific code.
3. **Version awareness**: Framework versions are handled by version-specific adapters (e.g., Laravel v12, v13).
4. **Testable output**: Generated code must be valid and pass the target framework's linting/compilation.

## Internal Representation

The platform should maintain a framework-independent representation of:
- Application structure
- Resources/Models
- API endpoints
- Authentication configuration
- Workflow definitions
- UI components

This representation is the single source of truth that generators consume.

## Future Targets

| Framework | Status | Versions |
|-----------|--------|----------|
| Laravel | PLANNED | v12, v13+ |
| NestJS | PLANNED | v10+ |
| Other | FUTURE | TBD |

## Architecture

```
Internal Definition
  ↓
Compiler (parses definition)
  ↓
Framework Adapter (selects target)
  ↓
Version Adapter (handles version differences)
  ↓
Template Engine (renders code)
  ↓
Generated Project
```

## What NOT to Do

- Do not put Laravel-specific logic in the core domain.
- Do not fork entire framework repos for each version.
- Do not generate code that requires manual fixing.
- Do not hard-code file paths or project structures.
