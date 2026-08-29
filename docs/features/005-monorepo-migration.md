# 005 — Monorepo Migration

## Status

**IMPLEMENTED** — Completed 2026-08-29.

## Goal

Convert the current single-package NestJS backend into a pnpm workspaces + Turborepo monorepo with a clear separation between:

- `apps/api` — NestJS backend
- `apps/web` — React frontend (minimal scaffold)
- `packages/workflow-core` — Framework-independent workflow engine and node system

## Problem

The current repository has all code in a single package. As the platform grows (frontend, code generators, framework adapters), the lack of package boundaries will lead to:

- Tight coupling between framework-independent logic and NestJS
- Difficulty reusing workflow/node logic in the code generator (Phase 10-12)
- No clear place for the frontend
- Build tooling that doesn't scale

## Scope

### In Scope

1. pnpm workspaces configuration
2. Turborepo build orchestration
3. Restructure existing code into `apps/api/`
4. Extract framework-independent code into `packages/workflow-core/`
5. Scaffold `apps/web/` with Vite + React + TypeScript
6. Shared TypeScript configuration
7. Shared ESLint/Prettier configuration
8. Test configuration for each package
9. Development scripts
10. Import path migration

### Non-Goals

- ❌ Full frontend implementation (only scaffold)
- ❌ Google Login — Phase 7
- ❌ Credentials — Phase 5
- ❌ Code generation — Phase 10-12
- ❌ Production deployment
- ❌ CI/CD pipeline
- ❌ Docker configuration

## Target Architecture

```
devflow-platform/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── health/
│   │   │   │   ├── projects/
│   │   │   │   └── workflows/
│   │   │   ├── shared/
│   │   │   │   ├── database/
│   │   │   │   ├── filters/
│   │   │   │   ├── interceptors/
│   │   │   │   └── dto/
│   │   │   ├── config/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── web/                          # React frontend (scaffold)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── vitest.config.ts
│
├── packages/
│   └── workflow-core/                # Framework-independent workflow/node logic
│       ├── src/
│       │   ├── types.ts              # Workflow definition types
│       │   ├── validator.ts          # Graph validation
│       │   ├── executor.ts           # Workflow execution engine
│       │   ├── node-system/          # Node registry, interfaces, validator
│       │   │   ├── interfaces.ts
│       │   │   ├── registry.ts
│       │   │   ├── validator.ts
│       │   │   └── builtin/          # Built-in node implementations
│       │   └── index.ts              # Public API barrel
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
│
├── tooling/
│   ├── base-tsconfig.json            # Shared TypeScript config
│   ├── base-eslint.config.js         # Shared ESLint config
│   └── .prettierrc                   # Shared Prettier config (root)
│
├── docs/                             # Unchanged
├── .ai/                              # Unchanged
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                      # Root workspace
├── tsconfig.json                     # Root (references)
├── .gitignore
├── AGENTS.md
└── README.md
```

## Package Boundaries — What Goes Where

### `packages/workflow-core`

**Purpose:** Framework-independent workflow engine and node system. Reusable by the API, future code generator, and future visual builder.

**What moves here:**

| Current Location | New Location | Rationale |
|-----------------|--------------|-----------|
| `src/modules/workflows/engine/types.ts` | `packages/workflow-core/src/types.ts` | Pure types, no imports |
| `src/modules/workflows/engine/workflow-validator.ts` | `packages/workflow-core/src/validator.ts` | Pure function, no imports |
| `src/modules/workflows/engine/workflow-executor.ts` | `packages/workflow-core/src/executor.ts` | Needs Logger abstraction |
| `src/modules/workflows/engine/node-system/node-type.interface.ts` | `packages/workflow-core/src/node-system/interfaces.ts` | Pure types |
| `src/modules/workflows/engine/node-system/node-registry.ts` | `packages/workflow-core/src/node-system/registry.ts` | Pure class |
| `src/modules/workflows/engine/node-system/node-validator.ts` | `packages/workflow-core/src/node-system/validator.ts` | Pure functions |
| `src/modules/workflows/engine/node-system/builtin/*.ts` | `packages/workflow-core/src/node-system/builtin/` | Pure implementations |

**What does NOT move:**

- NestJS `Logger` imports — replaced with abstract logger interface
- Prisma-specific code — stays in API
- HTTP-specific logic — stays in API

**Key refactoring for `executor.ts`:**

The current `WorkflowExecutor` imports `Logger` from `@nestjs/common`. To make it framework-independent:

```typescript
// Abstract logger interface
export interface Logger {
  log(message: string): void;
  error(message: string, stack?: string): void;
  warn(message: string): void;
}

// Executor accepts optional logger
export class WorkflowExecutor {
  constructor(private readonly logger?: Logger) { ... }
}
```

The API app provides a NestJS Logger adapter:

```typescript
const executor = new WorkflowExecutor({
  log: (msg) => this.logger.log(msg),
  error: (msg, stack) => this.logger.error(msg, stack),
  warn: (msg) => this.logger.warn(msg),
});
```

### `apps/api`

**Purpose:** NestJS backend API. Contains all NestJS-specific code, Prisma, and server logic.

**What stays:**

| Location | Rationale |
|----------|-----------|
| `src/modules/health/` | NestJS module |
| `src/modules/projects/` | NestJS module, Prisma-dependent |
| `src/modules/workflows/workflows.module.ts` | NestJS module registration |
| `src/modules/workflows/workflows.controller.ts` | NestJS controller |
| `src/modules/workflows/workflows.service.ts` | NestJS service, Prisma-dependent |
| `src/shared/database/` | Prisma service, NestJS module |
| `src/shared/filters/` | NestJS exception filter |
| `src/shared/interceptors/` | NestJS interceptor |
| `src/shared/dto/` | NestJS DTOs |
| `src/config/` | NestJS ConfigModule |
| `src/app.module.ts` | Root module |
| `src/main.ts` | Bootstrap |
| `prisma/` | Schema and migrations |

**Import changes in API:**

```typescript
// Before
import { WorkflowExecutor } from './engine/workflow-executor';
import { NodeRegistry } from './engine/node-system/node-registry';

// After
import { WorkflowExecutor, NodeRegistry } from '@devflow/workflow-core';
```

### `apps/web`

**Purpose:** React frontend application. Minimal scaffold for now.

**Initial setup:**

- Vite + React + TypeScript
- Vitest for testing
- React Router (for future routing)
- Basic layout component

**What it does NOT contain yet:**

- Full UI implementation
- API client
- Authentication
- Workflow builder
- Component library (will add later)

## Technology Decisions

### Build Orchestration: Turborepo

**Why Turborepo:**
- Lightweight, minimal configuration
- Works natively with pnpm workspaces
- Incremental builds and caching
- Standard choice in 2026 monorepos
- No vendor lock-in (unlike Nx)

**Alternative considered:** Nx — More features but heavier setup. Turborepo is sufficient for this project's current needs.

### Frontend: Vite + React + TypeScript

**Why Vite:**
- Standard React build tool in 2026
- Fast HMR
- Native ESM development
- TypeScript support out of the box

**Alternative considered:** Next.js — Server-side rendering not needed for this platform (API-only backend).

### Frontend Testing: Vitest

**Why Vitest:**
- Native ESM support (no transform issues)
- Compatible with Vite config
- Jest-compatible API (easy migration if needed)
- Faster than Jest for Vite-based projects

**Decision:** API keeps Jest (NestJS ecosystem), frontend uses Vitest.

### Package Manager: pnpm Workspaces

Already using pnpm. Adding workspace configuration is minimal.

## Detailed Migration Steps

### Step 1: Create root workspace configuration

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Update root `package.json`:
```json
{
  "name": "devflow-platform",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.3.0"
  }
}
```

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "clean": {
      "cache": false
    }
  }
}
```

### Step 2: Move existing API into `apps/api/`

```
apps/api/
├── src/                    (from root src/)
├── prisma/                 (from root prisma/)
├── package.json            (modified from root package.json)
├── tsconfig.json           (from root tsconfig.json, paths updated)
├── jest.config.ts          (from root jest.config.ts)
├── nest-cli.json           (from root nest-cli.json)
├── .eslintrc.js            (from root .eslintrc.js)
├── .env                    (gitignored, from root .env)
└── .env.example            (from root .env.example)
```

The API `package.json` moves all current dependencies:
```json
{
  "name": "@devflow/api",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@nestjs/common": "^10.4.0",
    "@nestjs/config": "^3.3.0",
    "@nestjs/core": "^10.4.0",
    "@nestjs/platform-express": "^10.4.0",
    "@devflow/workflow-core": "workspace:*",
    "@prisma/client": "^6.19.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "start:prod": "node dist/main",
    "test": "jest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:push": "prisma db push"
  }
}
```

### Step 3: Create `packages/workflow-core`

```
packages/workflow-core/
├── src/
│   ├── types.ts
│   ├── validator.ts
│   ├── executor.ts
│   ├── logger.interface.ts
│   ├── node-system/
│   │   ├── interfaces.ts
│   │   ├── registry.ts
│   │   ├── validator.ts
│   │   └── builtin/
│   │       ├── index.ts
│   │       ├── log.node.ts
│   │       ├── set-variable.node.ts
│   │       ├── no-op.node.ts
│   │       ├── http-request.node.ts
│   │       └── delay.node.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**package.json:**
```json
{
  "name": "@devflow/workflow-core",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^3.0.0"
  }
}
```

**Key change:** The executor's `Logger` import is replaced with an abstract interface in `packages/workflow-core/src/logger.interface.ts`:

```typescript
export interface Logger {
  log(message: string): void;
  error(message: string, stack?: string): void;
  warn(message: string): void;
}
```

### Step 4: Scaffold `apps/web`

Create using Vite's React TypeScript template:

```bash
pnpm create vite apps/web --template react-ts
```

**Minimal initial content:**

- `App.tsx` — Basic React component
- `main.tsx` — Entry point
- `vite.config.ts` — With proxy to API
- `vitest.config.ts` — Test configuration
- `package.json` — React, Vite, Vitest dependencies

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

### Step 5: Create shared tooling

**`tooling/base-tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Note:** The API will override `module: "commonjs"` since NestJS uses CommonJS. The packages use `module: "ESNext"` for modern bundler compatibility.

### Step 6: Update import paths

All imports from workflow-core change:

```typescript
// Before (in apps/api)
import { WorkflowExecutor } from '../../engine/workflow-executor';
import { NodeRegistry } from '../../engine/node-system/node-registry';
import { WorkflowDefinition } from '../../engine/types';

// After (in apps/api)
import { WorkflowExecutor, NodeRegistry, WorkflowDefinition } from '@devflow/workflow-core';
```

### Step 7: Update tests

**packages/workflow-core:**
- Move validator tests, executor tests, registry tests, node tests
- Use Vitest instead of Jest
- Tests are pure unit tests (no NestJS mocking needed)

**apps/api:**
- Keep controller and service tests (NestJS integration tests)
- Add integration test for workflow execution (calling through API)

### Step 8: Update documentation

- `docs/architecture/overview.md` — New monorepo structure
- `docs/state/PROJECT-STATE.md` — Updated
- `docs/state/CHANGELOG.md` — Migration entry
- `docs/dependencies/dependency-policy.md` — New packages

## Dependency Ownership

| Package | Owns Dependencies |
|---------|-------------------|
| Root | `turbo`, `prettier` |
| `@devflow/api` | `@nestjs/*`, `@prisma/client`, `class-validator`, `class-transformer`, `rxjs` |
| `@devflow/workflow-core` | None (zero runtime dependencies) |
| `apps/web` | `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `vitest` |

**Rule:** `@devflow/workflow-core` must NEVER have runtime dependencies. It is pure TypeScript.

## Environment Variable Boundaries

| Variable | `apps/api` | `apps/web` | `packages/workflow-core` |
|----------|-----------|-----------|------------------------|
| `DATABASE_URL` | ✅ | ❌ | ❌ |
| `PORT` | ✅ | ❌ | ❌ |
| `NODE_ENV` | ✅ | ✅ | ❌ |
| `VITE_API_URL` | ❌ | ✅ | ❌ |

## API ↔ Frontend Communication

The frontend communicates with the API via HTTP:

- **Development:** Vite proxy (`/api` → `http://localhost:3000`)
- **Production:** Same-origin or configured `VITE_API_URL`

No shared runtime code between frontend and API beyond `@devflow/workflow-core` types (for type-safe API contracts in the future).

## Code Generator Boundaries (Future)

When the code generator (Phase 10-12) is implemented:

```
packages/workflow-core    ← Reads definitions, validates, no execution
packages/compiler-core    ← Uses workflow-core types, generates code
apps/api                  ← Uses workflow-core for runtime, compiler for generation
```

The code generator will import types from `@devflow/workflow-core` but will NOT import the executor or node handlers (those are runtime-only).

## Docker / Deployment Considerations

**Not in scope for this migration.** Future deployment may use:

- API: Docker container with NestJS build
- Web: Static files served by nginx or CDN
- Each app builds independently via Turborepo

Document this as future work only.

## Migration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Import path changes break tests | High | Medium | Update all imports, run tests after each step |
| Prisma schema path changes | Medium | High | Update `prisma/schema.prisma` path in package.json |
| TypeScript config conflicts | Medium | Medium | Use shared base config with per-package overrides |
| NestJS build breaks with workspace deps | Low | High | Test build after migration |
| Vitest vs Jest confusion | Low | Low | Clear documentation per package |
| Circular dependency between packages | Low | High | workflow-core has zero NestJS/API imports |

## Rollback Strategy

1. Keep the original `src/` structure in git history
2. Create a migration branch (`feat/monorepo-migration`)
3. If migration fails, revert the branch
4. The workflow-core package is additive — no existing code is deleted, only moved

## Verification Commands

After migration, verify everything works:

```bash
# Install all dependencies
pnpm install

# Build all packages in dependency order
pnpm build

# Run all tests
pnpm test

# Typecheck all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Start API in dev mode
cd apps/api && pnpm dev

# Start Web in dev mode
cd apps/web && pnpm dev

# Verify API health check
curl http://localhost:3000/api/v1/health
```

## Files Changed

| File | Action |
|------|--------|
| `pnpm-workspace.yaml` | Created |
| `turbo.json` | Created |
| `package.json` | Modified (root workspace) |
| `tooling/base-tsconfig.json` | Created |
| `apps/api/package.json` | Created (from root) |
| `apps/api/tsconfig.json` | Created (from root) |
| `apps/api/jest.config.ts` | Created (from root) |
| `apps/api/nest-cli.json` | Created (from root) |
| `apps/api/src/**` | Moved from `src/` |
| `apps/api/prisma/**` | Moved from `prisma/` |
| `apps/web/package.json` | Created (scaffold) |
| `apps/web/src/App.tsx` | Created (scaffold) |
| `apps/web/vite.config.ts` | Created |
| `packages/workflow-core/package.json` | Created |
| `packages/workflow-core/src/**` | Moved from `src/modules/workflows/engine/` |
| `packages/workflow-core/tsconfig.json` | Created |
| Root `tsconfig.json` | Modified (project references) |

## Completion Checklist

- [x] Plan approved by human
- [x] pnpm-workspace.yaml created
- [x] turbo.json created
- [x] Root package.json updated
- [x] `apps/api/` — all NestJS code moved and working
- [x] `apps/api/` — Prisma schema and migrations working
- [x] `apps/api/` — tests passing (48 tests)
- [x] `packages/workflow-core/` — extracted and building
- [x] `packages/workflow-core/` — zero runtime dependencies
- [x] `packages/workflow-core/` — tests passing with Vitest (65 tests)
- [x] `apps/web/` — Vite scaffold created
- [x] `apps/web/` — typecheck passes
- [x] All import paths updated
- [x] `pnpm build` succeeds
- [x] `pnpm test` succeeds (113 total tests)
- [x] `pnpm typecheck` succeeds
- [x] `pnpm lint` succeeds
- [x] Documentation updated
