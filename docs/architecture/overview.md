# Architecture Overview

## Status: Foundation Established

## High-Level Architecture

The DevFlow Platform is a NestJS-based backend that will eventually support:

```
┌─────────────────────────────────────────────────────┐
│                    API Layer                         │
│              (NestJS Controllers)                    │
├─────────────────────────────────────────────────────┤
│                  Domain Layer                        │
│              (Business Logic Services)               │
├─────────────────────────────────────────────────────┤
│                Infrastructure Layer                  │
│         (Database, Cache, External APIs)             │
├─────────────────────────────────────────────────────┤
│                  Runtime Layer                       │
│         (Workflow Execution, Node System)            │
├─────────────────────────────────────────────────────┤
│                Compilation Layer                     │
│        (Code Generation, Framework Adapters)         │
└─────────────────────────────────────────────────────┘
```

## Current State

The project is at the bootstrap stage. Only the foundation is established:

- **Implemented**: NestJS application skeleton with health endpoint
- **Planned**: Workflow engine, node system, code generation, UI builder
- **Future**: Full platform with visual builder, runtime, and exporters

## Module Structure (Current)

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app.controller.ts          # Health endpoint
└── app.controller.spec.ts     # Health endpoint test
```

## Planned Module Structure (Future)

```
src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── projects/              # Project management
│   ├── workflows/             # Workflow definitions
│   ├── nodes/                 # Workflow node system
│   ├── credentials/           # Credential management
│   ├── runtime/               # Workflow execution engine
│   ├── compiler/              # Code generation
│   └── preview/               # Preview system
└── shared/
    ├── interfaces/            # Shared interfaces
    ├── constants/             # Shared constants
    └── utils/                 # Shared utilities
```

## Key Principles

See `docs/architecture/principles.md` for the full list of architecture principles.

## Future Product Architecture

```
apps/
├── api/                       # NestJS backend API
├── worker/                    # Background job processing
└── web/                       # Frontend (future)

packages/
├── workflow-core/             # Workflow definition and execution
├── node-core/                 # Node system and registry
├── compiler-core/             # Code generation engine
├── shared/                    # Shared types and utilities
└── framework-adapters/        # Laravel, NestJS, etc.
```

## Dependencies

- **NestJS** — Backend framework
- **TypeScript** — Type safety
- **class-validator** — Input validation
- **class-transformer** — Data transformation

## Related Documentation

- `docs/architecture/principles.md` — Architecture principles
- `docs/development/feature-lifecycle.md` — Development lifecycle
- `docs/development/ai-development.md` — AI development model
