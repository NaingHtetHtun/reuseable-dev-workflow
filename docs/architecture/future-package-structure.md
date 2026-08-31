# Future Package Structure

## Status: PLANNED — Not Yet Implemented

When the project grows, it should be organized as a monorepo with separate packages.

## Planned Structure

```
devflow-platform/
├── apps/
│   ├── api/                    # NestJS backend API
│   ├── worker/                 # Background job processing
│   └── web/                    # Frontend application (future)
│
├── packages/
│   ├── workflow-core/          # Workflow definition and execution
│   │   ├── src/
│   │   │   ├── definition/     # Workflow definition parsing
│   │   │   ├── execution/      # Workflow runtime execution
│   │   │   └── validation/     # Workflow validation
│   │   └── package.json
│   │
│   ├── node-core/              # Node system and registry
│   │   ├── src/
│   │   │   ├── registry/       # Node type registry
│   │   │   ├── base-nodes/     # Built-in node types
│   │   │   └── interfaces/     # Node interfaces
│   │   └── package.json
│   │
│   ├── compiler-core/          # Code generation engine
│   │   ├── src/
│   │   │   ├── parser/         # Definition parser
│   │   │   ├── generators/     # Code generators
│   │   │   └── templates/      # Framework templates
│   │   └── package.json
│   │
│   ├── shared/                 # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/          # Shared TypeScript types
│   │   │   ├── constants/      # Shared constants
│   │   │   └── utils/          # Shared utilities
│   │   └── package.json
│   │
│   └── framework-adapters/     # Framework-specific adapters
│       ├── laravel/
│       │   ├── v12/
│       │   └── v13/
│       ├── nestjs/
│       └── package.json
│
├── docs/
├── AGENTS.md
└── package.json
```

## When to Migrate

Migrate to this structure when:

- There are multiple deployable applications
- Packages need to be independently versioned
- The codebase has grown beyond a single NestJS module
- Multiple teams or contributors need clear boundaries

## Package Manager

Use pnpm workspaces for monorepo management.
