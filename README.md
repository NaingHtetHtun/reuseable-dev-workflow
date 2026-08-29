# DevFlow Platform

A developer-focused visual application/workflow platform for building reusable development components, workflow automation, and framework-aware code generation.

## Status

**Bootstrap Phase** — Development system established. Feature implementation has not started.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start:dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
```

## Development Model

This project uses an AI-assisted development model. See `AGENTS.md` for the full development contract.

**Core rule**: DO NOT CODE BEFORE PLAN APPROVAL.

## Project Structure

```
├── AGENTS.md                    # Development contract for AI agents
├── .ai/
│   ├── skills/                  # Engineering discipline skills
│   └── prompts/                 # Workflow prompt templates
├── docs/
│   ├── architecture/            # Architecture documentation
│   ├── development/             # Development process docs
│   ├── features/                # Feature documentation
│   ├── testing/                 # Testing strategy
│   ├── dependencies/            # Dependency policy
│   ├── decisions/               # Architecture decision records
│   └── state/                   # Project state & session continuity
│       ├── PROJECT-STATE.md     # Current project state snapshot
│       ├── CURRENT-WORK.md      # Active work tracking
│       └── CHANGELOG.md         # Completed work history
├── src/                         # Application source code
│   ├── main.ts
│   ├── app.module.ts
│   └── app.controller.ts
└── test/                        # E2E tests
```

## Technology Stack

- **Backend**: NestJS
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [Architecture Principles](docs/architecture/principles.md)
- [Feature Lifecycle](docs/development/feature-lifecycle.md)
- [AI Development Model](docs/development/ai-development.md)
- [Session Continuity](docs/development/session-continuity.md)
- [Testing Strategy](docs/testing/testing-strategy.md)
- [Dependency Policy](docs/dependencies/dependency-policy.md)
- [Definition of Done](docs/development/definition-of-done.md)
- [Project State](docs/state/PROJECT-STATE.md)
- [Current Work](docs/state/CURRENT-WORK.md)
- [Changelog](docs/state/CHANGELOG.md)

## License

UNLICENSED — Private project.
