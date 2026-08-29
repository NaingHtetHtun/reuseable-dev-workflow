# 002 — Projects Module

## Status

**IMPLEMENTED** — Completed 2026-08-29.

## Goal

Implement the first domain module (Projects) that establishes the standard pattern all future modules will follow. Projects are the top-level container — everything in the platform (workflows, nodes, credentials, components) is scoped to a project.

## Problem

The platform has no concept of "projects" yet. Workflows, nodes, and credentials need a parent entity to belong to. This module creates that foundation and proves out the module pattern.

## Scope

### In Scope

1. **Project data model** — Prisma schema update with `description` field.
2. **Prisma migration** — Database migration for the projects table changes.
3. **NestJS module** — `src/modules/projects/` with module, controller, service.
4. **DTOs** — Create, update, and response DTOs with validation.
5. **Service layer** — Business logic for CRUD operations.
6. **Controller layer** — REST API endpoints.
7. **Error handling** — NotFound exceptions for missing projects.
8. **Pagination** — List endpoint with pagination (using existing `PaginationDto`).
9. **Filtering/search** — Search projects by name.
10. **Testing** — Unit tests for service, integration tests for controller.
11. **Documentation** — Feature documentation.

### Non-Goals

- ❌ Authentication/authorization (Phase 14)
- ❌ Project settings beyond name and description (future)
- ❌ Project deletion cascade (future)
- ❌ Soft deletion (future)
- ❌ Project members/permissions (future)
- ❌ Project configuration (future)
- ❌ Workflow engine (Phase 3)
- ❌ Credentials (Phase 5)
- ❌ Resource CRUD builder (Phase 8)
- ❌ Code generation (Phase 10)
- ❌ Frontend UI

## User Experience

After implementation, a developer can:

```bash
# Start the application
pnpm start:dev

# Create a project
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "description": "A test project"}'

# List projects
curl http://localhost:3000/api/v1/projects

# List projects with pagination
curl "http://localhost:3000/api/v1/projects?page=1&limit=10"

# Search projects by name
curl "http://localhost:3000/api/v1/projects?search=my"

# Get a project
curl http://localhost:3000/api/v1/projects/{id}

# Update a project
curl -X PATCH http://localhost:3000/api/v1/projects/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete a project
curl -X DELETE http://localhost:3000/api/v1/projects/{id}
```

## Architecture

### Directory Structure

```
src/modules/projects/
├── projects.module.ts              # NestJS module
├── projects.controller.ts          # REST API controller
├── projects.service.ts             # Business logic service
├── dto/
│   ├── create-project.dto.ts       # Create DTO with validation
│   ├── update-project.dto.ts       # Update DTO (partial)
│   └── project-response.dto.ts     # Response DTO (excludes internal fields)
└── projects.controller.spec.ts     # Integration tests
```

### Pattern Established

This module establishes the standard domain-module pattern:

```
modules/{domain}/
├── {domain}.module.ts
├── {domain}.controller.ts
├── {domain}.service.ts
├── dto/
│   ├── create-{domain}.dto.ts
│   ├── update-{domain}.dto.ts
│   └── {domain}-response.dto.ts
└── {domain}.controller.spec.ts
```

Future modules (workflows, nodes, credentials) will follow this exact structure.

### Key Decisions

1. **Service receives PrismaService** — Same pattern as HealthService.
2. **DTOs for input validation** — class-validator decorators.
3. **Response DTOs** — Never expose internal fields (createdAt internals, etc.).
4. **NotFound exceptions** — Use `NotFoundException` from `@nestjs/common`.
5. **Pagination via query params** — Reuse existing `PaginationDto`.
6. **Search via query param** — `?search=term` for name-based search.
7. **Module registered in AppModule** — Import `ProjectsModule` in `AppModule`.

## Data Model

### Prisma Schema Change

```prisma
model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("projects")
}
```

**Changes from current schema:**
- Added `description` field (optional string)

### Database Migration

A Prisma migration will be generated for the `description` field addition.

## API

### Endpoints

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/api/v1/projects` | Create a project | 201 |
| GET | `/api/v1/projects` | List projects (paginated) | 200 |
| GET | `/api/v1/projects/:id` | Get a project by ID | 200 |
| PATCH | `/api/v1/projects/:id` | Update a project | 200 |
| DELETE | `/api/v1/projects/:id` | Delete a project | 204 |

### Request/Response Formats

#### POST /api/v1/projects

Request:
```json
{
  "name": "My Project",
  "description": "Optional description"
}
```

Response 201:
```json
{
  "id": "uuid-here",
  "name": "My Project",
  "description": "Optional description",
  "createdAt": "2026-08-29T12:00:00.000Z",
  "updatedAt": "2026-08-29T12:00:00.000Z"
}
```

Validation error 400:
```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "name must be a string"],
  "error": "Bad Request",
  "timestamp": "2026-08-29T12:00:00.000Z",
  "path": "/api/v1/projects"
}
```

#### GET /api/v1/projects

Query params: `page`, `limit`, `search`

Response 200:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Project 1",
      "description": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

#### GET /api/v1/projects/:id

Response 200:
```json
{
  "id": "uuid",
  "name": "Project 1",
  "description": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Response 404:
```json
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "Not Found",
  "timestamp": "...",
  "path": "/api/v1/projects/some-id"
}
```

#### PATCH /api/v1/projects/:id

Request:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

Response 200: Same as GET response.

#### DELETE /api/v1/projects/:id

Response 204: No body.

## Runtime Behavior

1. Request arrives at controller.
2. Controller validates input via DTOs.
3. Controller calls service method.
4. Service performs database operation via PrismaService.
5. Service returns result.
6. Controller sends response.
7. On error, global exception filter handles it.

## Security

- No authentication yet (Phase 14).
- Input validation on all endpoints (class-validator).
- No secrets or credentials involved.

## Dependencies

### New Dependencies

None. All required packages are already installed:
- `@prisma/client` — Database access
- `class-validator` — Input validation
- `class-transformer` — Data transformation
- `@nestjs/testing` — Test utilities

### No new packages needed for this feature.

## Testing Strategy

### Unit Tests — `projects.service.spec.ts`

Test each service method in isolation (mock PrismaService):
- `create` — creates project with valid data
- `findAll` — returns paginated projects
- `findAll` with search — filters by name
- `findOne` — returns project by ID
- `findOne` — throws NotFoundException for missing ID
- `update` — updates project fields
- `update` — throws NotFoundException for missing ID
- `remove` — deletes project
- `remove` — throws NotFoundException for missing ID

### Integration Tests — `projects.controller.spec.ts`

Test full HTTP flow (real controller, mocked service):
- POST /projects — creates and returns project
- POST /projects — validates missing name
- GET /projects — returns paginated list
- GET /projects?search=term — filters results
- GET /projects/:id — returns project
- GET /projects/:id — returns 404 for missing
- PATCH /projects/:id — updates and returns project
- DELETE /projects/:id — returns 204

### Test Pattern

```typescript
describe('ProjectsService', () => {
  let service: ProjectsService;
  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });
});
```

## Preview

After implementation, verify with:

```bash
# 1. Start the application
pnpm start:dev

# 2. Create a project
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Testing"}'

# 3. List projects
curl http://localhost:3000/api/v1/projects

# 4. Run all checks
pnpm test && pnpm typecheck && pnpm lint
```

## Export / Code Generation

Not applicable for this feature. Project definitions will later be consumed by the code generation engine.

## Documentation

After implementation, update:
- `docs/architecture/overview.md` — Add projects module to module structure
- `docs/state/PROJECT-STATE.md` — Update completed items
- `docs/state/CURRENT-WORK.md` — Clear active task
- `docs/state/CHANGELOG.md` — Add completion entry
- `docs/dependencies/dependency-policy.md` — No changes (no new deps)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration fails on existing data | Low | Low | No existing data (fresh schema) |
| Prisma client generation fails | Low | Low | Run `pnpm db:generate` after schema change |
| Test isolation issues | Low | Low | Mock PrismaService in all unit tests |

## Known Limitations

- No authentication — anyone can CRUD projects.
- No soft deletion — deletes are permanent.
- No project settings beyond name and description.
- No project membership/permissions.
- No project configuration.

## Files Changed

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Modified (added `description` field) |
| `src/modules/projects/projects.module.ts` | Created |
| `src/modules/projects/projects.controller.ts` | Created |
| `src/modules/projects/projects.service.ts` | Created |
| `src/modules/projects/dto/create-project.dto.ts` | Created |
| `src/modules/projects/dto/update-project.dto.ts` | Created |
| `src/modules/projects/dto/project-response.dto.ts` | Created |
| `src/modules/projects/dto/project-query.dto.ts` | Created |
| `src/modules/projects/dto/index.ts` | Created |
| `src/modules/projects/projects.service.spec.ts` | Created |
| `src/modules/projects/projects.controller.spec.ts` | Created |
| `src/app.module.ts` | Modified (added ProjectsModule import) |

## Completion Checklist

- [x] Plan approved by human
- [x] Prisma schema updated with `description` field
- [x] Prisma client regenerated
- [x] ProjectsModule created and registered in AppModule
- [x] ProjectsService implements all CRUD operations
- [x] ProjectsController exposes all endpoints
- [x] DTOs validate input correctly
- [x] NotFound exceptions for missing projects
- [x] Pagination works on list endpoint
- [x] Search works on list endpoint
- [x] Unit tests written and passing (11 tests)
- [x] Integration tests written and passing (17 tests)
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Feature documentation updated
- [x] Preview provided for human review
