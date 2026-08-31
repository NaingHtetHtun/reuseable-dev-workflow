# 001 — Project Foundation

## Status

**IMPLEMENTED** — Completed 2026-08-29.

## Goal

Establish the minimum viable foundation for the DevFlow Platform: a well-structured NestJS application with database integration, configuration management, logging, error handling, validation, API versioning, health checks, and testing infrastructure.

## Problem

The current project is a bare NestJS skeleton with a single health endpoint. To begin building actual platform features (projects, workflows, nodes, etc.), we need foundational infrastructure that all future modules will depend on.

## Scope

### In Scope

1. **NestJS module structure** — Organize code into `src/modules/` and `src/shared/` directories.
2. **Configuration management** — `@nestjs/config` with `.env` support and typed config service.
3. **Database foundation** — ORM setup, base entity, migrations, connection management.
4. **Logging** — Structured logging with NestJS LoggerModule.
5. **Global error handling** — Exception filter for consistent error responses.
6. **Request validation** — Already partially in place (ValidationPipe), enhance with global setup.
7. **API structure/versioning** — Versioned API routes (`/api/v1/...`).
8. **Health checks** — Enhanced health endpoint with database connectivity check.
9. **Testing foundation** — Test helpers, database test setup, fixtures pattern.
10. **Development scripts** — Database migration commands, seed commands.
11. **Code quality checks** — Commit hooks or enhanced lint config (lightweight).

### Non-Goals

- ❌ Projects module (future feature)
- ❌ Workflows module (future feature)
- ❌ Authentication/authorization (future feature)
- ❌ Background workers (future feature)
- ❌ Frontend/UI (future feature)
- ❌ Code generation engine (future feature)
- ❌ Monorepo migration (future consideration)
- ❌ Redis/cache layer (not needed yet)
- ❌ Docker/docker-compose (not needed for foundation)
- ❌ CI/CD pipeline (not needed for foundation)

## User Experience

After implementation, a developer can:

```bash
# Start the application
pnpm start:dev

# Run all checks
pnpm typecheck && pnpm lint && pnpm test

# Manage database
pnpm db:migrate        # Run pending migrations
pnpm db:migrate:dev    # Create and apply migration
pnpm db:seed           # Seed database
pnpm db:studio         # Open database GUI (Prisma)

# Verify health (with DB check)
curl http://localhost:3000/api/v1/health
```

## Architecture

### Directory Structure

```
src/
├── main.ts                              # Application entry point
├── app.module.ts                        # Root module
│
├── config/
│   ├── app.config.ts                    # App configuration schema
│   └── database.config.ts               # Database configuration schema
│
├── shared/
│   ├── database/
│   │   ├── database.module.ts           # Database module (NestJS)
│   │   ├── prisma.service.ts            # Prisma service (lifecycle mgmt)
│   │   └── base.entity.ts               # Base entity interface/types
│   ├── filters/
│   │   └── http-exception.filter.ts     # Global exception filter
│   ├── interceptors/
│   │   └── logging.interceptor.ts       # Request logging interceptor
│   └── dto/
│       └── pagination.dto.ts            # Shared pagination DTO
│
├── modules/
│   └── health/
│       ├── health.module.ts
│       ├── health.controller.ts
│       ├── health.service.ts
│       └── health.controller.spec.ts
│
└── prisma/
    ├── schema.prisma                    # Prisma schema
    └── seed.ts                          # Database seed script
```

### Key Decisions

1. **One shared database module** in `src/shared/database/` — all feature modules import it.
2. **Config via `@nestjs/config`** — environment-based, typed, validated.
3. **Prisma as ORM** — see database decision below.
4. **API versioning via URI** — `/api/v1/...` prefix.
5. **Global exception filter** — consistent error response format.
6. **Global validation pipe** — already in `main.ts`, formalize in module.

## Data Model

### Base Entity Pattern

No traditional base entity class. Instead, Prisma schema will define shared fields:

```prisma
model Project {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("projects")
}
```

All models will share:

- `id`: UUID string
- `createdAt`: timestamp with default
- `updatedAt`: auto-updated timestamp

### Database: Prisma

**Selected: Prisma** — see Database Decision section below.

Initial schema (minimal — just the foundation):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("projects")
}
```

## Runtime Behavior

1. Application starts, connects to PostgreSQL via Prisma.
2. Configuration loaded from environment variables.
3. All requests pass through validation pipe and logging interceptor.
4. Errors return consistent JSON format.
5. Health endpoint checks database connectivity.

## API

### Health Check

```
GET /api/v1/health

Response 200:
{
  "status": "ok",
  "timestamp": "2026-08-29T12:00:00.000Z",
  "database": "connected"
}

Response 503:
{
  "status": "error",
  "timestamp": "2026-08-29T12:00:00.000Z",
  "database": "disconnected"
}
```

### Error Response Format

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request",
  "timestamp": "2026-08-29T12:00:00.000Z",
  "path": "/api/v1/users"
}
```

## Security

- No secrets in source code — all via environment variables.
- `.env` in `.gitignore` — already configured.
- `.env.example` with placeholder values — already exists.
- Database credentials never logged.
- Input validation on all endpoints via global ValidationPipe.

## Database Decision

### Options Evaluated

| Criteria                    | Prisma                                                | TypeORM                                | Drizzle                                         |
| --------------------------- | ----------------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| **NestJS official support** | ✅ Official recipe (`docs.nestjs.com/recipes/prisma`) | ✅ Official module (`@nestjs/typeorm`) | ❌ No official recipe (GitHub issue #3038 open) |
| **Current version**         | Prisma 8 (latest, 2026)                               | TypeORM 1.0 (latest, 2026)             | Drizzle ORM 0.44+ (latest, Aug 2025)            |
| **Schema approach**         | Dedicated `.prisma` DSL + code generation             | TypeScript decorators                  | TypeScript schema definitions                   |
| **Type safety**             | Generated client (must run `prisma generate`)         | Inferred from entities                 | Inferred directly from schema (no codegen)      |
| **Migration tooling**       | Best-in-class (`prisma migrate dev/deploy`)           | Manual migration files                 | `drizzle-kit generate/migrate`                  |
| **Query style**             | Nested JS objects, auto-complete                      | Repository/QueryBuilder/Active Record  | SQL-like query builder + relational API         |
| **Performance**             | Rust query engine adds slight overhead                | Moderate                               | Lightest (zero dependencies)                    |
| **Edge runtime**            | Limited (Data Proxy / Accelerate)                     | No                                     | Yes (Cloudflare Workers, Deno)                  |
| **Raw SQL**                 | `$queryRaw` escape hatch                              | `dataSource.query()`                   | First-class (query builder IS SQL-like)         |
| **Community/docs**          | Largest community, best docs                          | Established, mature                    | Growing fast, good docs                         |
| **License**                 | Apache 2.0                                            | MIT                                    | Apache 2.0                                      |

### Recommendation: **Prisma**

**Rationale for this project:**

1. **Official NestJS support** — Prisma has an official recipe in the NestJS documentation. TypeORM has an official module. Drizzle has neither. For a project that will grow into many modules, official support matters.

2. **Best migration tooling** — `prisma migrate dev` is the most mature migration system. This project will have many models across projects, workflows, nodes, credentials. Reliable migrations are critical.

3. **Schema as single source of truth** — The `.prisma` schema file is a clean, readable, framework-independent definition. This aligns with Principle 6 (Stable Internal Representation). The schema can later be consumed by code generators without coupling to runtime ORM behavior.

4. **Mature ecosystem** — Largest community, widest adoption, best documentation. When building a platform that many developers will use, ecosystem maturity reduces risk.

5. **Clean separation** — Prisma's schema-first approach naturally separates "what the data looks like" from "how we query it." This fits the modular architecture.

**Tradeoffs accepted:**

- Prisma adds a code generation step (`prisma generate`). This is a minor inconvenience but ensures type safety.
- Prisma's Rust query engine adds slight overhead vs Drizzle. For this project's use case (developer platform, not high-frequency trading), this is negligible.
- Edge runtime compatibility is limited. Not a concern for a NestJS backend.

**Why not TypeORM?**

TypeORM 1.0 is a solid choice and has official NestJS support. However:

- Decorator-heavy approach adds visual noise to entity files.
- Migration tooling is less polished than Prisma.
- Three different query APIs (Active Record, Data Mapper, QueryBuilder) can lead to inconsistent code.
- Development cadence has slowed compared to Prisma and Drizzle.

**Why not Drizzle?**

Drizzle is excellent (fastest, lightest, best edge support). However:

- No official NestJS recipe or module.
- Integration requires manual wiring (custom providers).
- For a platform that will have many interconnected models, Prisma's schema DSL is cleaner than TypeScript schema definitions.
- If edge runtime support becomes important in the future, Drizzle can be revisited.

### Prisma Packages Required

| Package          | Purpose                   | Type          |
| ---------------- | ------------------------- | ------------- |
| `prisma`         | CLI and schema management | devDependency |
| `@prisma/client` | Generated database client | dependency    |

### Prisma Commands (added to package.json)

```json
{
  "db:migrate": "prisma migrate deploy",
  "db:migrate:dev": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:seed": "prisma db seed",
  "db:studio": "prisma studio",
  "db:push": "prisma db push"
}
```

## Dependencies

### New Runtime Dependencies

| Package          | Version | Purpose                  | Justification                                 |
| ---------------- | ------- | ------------------------ | --------------------------------------------- |
| `@prisma/client` | ^6.x    | Database client          | ORM for PostgreSQL access                     |
| `@nestjs/config` | ^3.x    | Configuration management | Environment variable handling with validation |

### New Dev Dependencies

| Package  | Version | Purpose                   | Justification                    |
| -------- | ------- | ------------------------- | -------------------------------- |
| `prisma` | ^6.x    | CLI and migration tooling | Schema management and migrations |

### Why These Dependencies

- **`@prisma/client` + `prisma`**: Database access is a core requirement. Prisma selected over TypeORM/Drizzle (see decision above).
- **`@nestjs/config`**: Already a common NestJS pattern. Provides typed, validated configuration from environment variables. Lighter than manual `process.env` handling.

No other dependencies are needed for this foundation.

## Testing Strategy

### Unit Tests

- **PrismaService** — Test lifecycle methods (connect, disconnect).
- **HealthService** — Test health check logic (mock PrismaService).
- **HttpExceptionFilter** — Test error response formatting.
- **Config** — Test configuration loading.

### Integration Tests

- **Health endpoint** — Test full HTTP flow with database check.
- **Database** — Test actual database operations (requires test database).

### Test Setup

- Use `@nestjs/testing` `TestingModule` for all tests.
- Mock PrismaService in unit tests.
- Use test database (separate PostgreSQL instance or SQLite for tests).

### Test Commands

```bash
pnpm test              # Unit tests
pnpm test:cov          # With coverage
pnpm test:e2e          # E2E tests (requires database)
```

## Preview

After implementation, verify with:

```bash
# 1. Start the application
pnpm start:dev

# 2. Check health endpoint
curl http://localhost:3000/api/v1/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "database": "connected"
# }

# 3. Run all checks
pnpm typecheck && pnpm lint && pnpm test

# 4. Check database
pnpm db:studio
```

## Export / Code Generation

Not applicable for this foundation feature. The database schema defined here will later be consumed by the code generation engine.

## Documentation

After implementation, update:

- `docs/architecture/overview.md` — Update module structure
- `docs/dependencies/dependency-policy.md` — Add new dependencies
- `docs/state/PROJECT-STATE.md` — Update completed items
- `docs/state/CHANGELOG.md` — Add completion entry

## Risks

| Risk                                        | Likelihood | Impact | Mitigation                                                |
| ------------------------------------------- | ---------- | ------ | --------------------------------------------------------- |
| Prisma version compatibility with NestJS 10 | Low        | Medium | Prisma 8 works with NestJS 10 (verified in official docs) |
| Database setup complexity                   | Low        | Low    | Use Docker or local PostgreSQL; `.env` configuration      |
| Migration conflicts                         | Low        | Low    | Small, focused migrations; one team working               |
| Performance overhead from Prisma engine     | Low        | Low    | Acceptable for this use case; can optimize later          |

## Known Limitations

- Only PostgreSQL supported initially (Prisma config). Other databases can be added later.
- No Redis/cache layer — not needed for foundation.
- No Docker setup — developer must have PostgreSQL running locally.
- No CI/CD — not part of foundation scope.

## Files Changed

| File                                             | Action                              |
| ------------------------------------------------ | ----------------------------------- |
| `prisma/schema.prisma`                           | Created                             |
| `prisma/seed.ts`                                 | Created                             |
| `src/config/app.config.ts`                       | Created                             |
| `src/config/database.config.ts`                  | Created                             |
| `src/shared/database/database.module.ts`         | Created                             |
| `src/shared/database/prisma.service.ts`          | Created                             |
| `src/shared/filters/http-exception.filter.ts`    | Created                             |
| `src/shared/interceptors/logging.interceptor.ts` | Created                             |
| `src/shared/dto/pagination.dto.ts`               | Created                             |
| `src/modules/health/health.module.ts`            | Created                             |
| `src/modules/health/health.controller.ts`        | Created                             |
| `src/modules/health/health.service.ts`           | Created                             |
| `src/modules/health/health.controller.spec.ts`   | Created                             |
| `src/modules/health/health.service.spec.ts`      | Created                             |
| `src/app.module.ts`                              | Modified                            |
| `src/app.module.spec.ts`                         | Created                             |
| `src/main.ts`                                    | Modified                            |
| `.env.example`                                   | Modified                            |
| `package.json`                                   | Modified                            |
| `jest.config.ts`                                 | Modified                            |
| `src/app.controller.ts`                          | Removed (replaced by health module) |
| `src/app.controller.spec.ts`                     | Removed (replaced by health module) |

## Completion Checklist

- [x] Plan approved by human
- [x] Prisma schema created and working
- [x] Database module created and functional
- [x] Configuration management working
- [x] Logging interceptor working
- [x] Global exception filter working
- [x] API versioning working (`/api/v1/`)
- [x] Health endpoint enhanced with DB check
- [x] Unit tests written and passing (5 tests)
- [x] Integration tests written and passing
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] `pnpm format` passes
- [x] Feature documentation updated
- [x] Preview provided for human review
- [x] Human reviewed and accepted
