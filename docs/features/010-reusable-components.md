# 010 — Reusable Component System

## Status

**IMPLEMENTED** — All verification criteria met.

## Goal

Establish a framework for defining, storing, and managing reusable development components. Components are the core product vision — build once, reuse across projects and frameworks.

## Problem

Currently, there is no way to:

- Define reusable development components (auth, CRUD, email, etc.)
- Store component definitions with versioning
- Search and discover components
- Manage component metadata (author, tags, description)
- Reference components from workflows

This means developers must rebuild the same foundation for every project.

## Scope

### In Scope

1. **Component definition format** — Framework-independent JSON schema for components
2. **Component entity** — Prisma model for storing components
3. **Component CRUD API** — Create, read, update, delete components
4. **Component versioning** — Semantic versioning with history
5. **Component metadata** — Description, author, tags, category, status
6. **Component configuration schema** — JSON Schema for user-configurable options
7. **Component credential schema** — What credentials the component requires
8. **Component search and filtering** — By name, tag, category, status
9. **Component status lifecycle** — Draft, published, deprecated
10. **Component cloning** — Fork a component for modification
11. **API endpoints** — Full REST API for component management
12. **Unit and integration tests** — Full test coverage

### Non-Goals

- ❌ Component execution (Phase 10 — Code Generation)
- ❌ Component preview (future enhancement)
- ❌ Component marketplace UI (future)
- ❌ Component sharing between projects (future)
- ❌ Component dependencies (future)
- ❌ Component testing framework (future)

## Architecture

### Design Principles

1. **Framework-independent** — Component definitions live in `packages/workflow-core`
2. **Versioned** — Every change creates a new version
3. **Composable** — Components reference other components (future)
4. **Searchable** — Rich metadata for discovery
5. **Project-scoped** — Components belong to projects (can be made global later)

### Component Definition Format

```typescript
// packages/workflow-core/src/component-system/component-types.ts

/** Component status lifecycle */
export type ComponentStatus = 'draft' | 'published' | 'deprecated';

/** A reusable development component definition */
export interface ComponentDefinition {
  /** Unique identifier (auto-generated) */
  id: string;
  /** Component name (unique within project) */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Detailed description of what the component does */
  description: string;
  /** Component version (semver) */
  version: string;
  /** Component status */
  status: ComponentStatus;
  /** Category for grouping (e.g., 'auth', 'crud', 'email', 'notification') */
  category: string;
  /** Tags for search and filtering */
  tags: string[];
  /** Author name or identifier */
  author: string;
  /** Project ID this component belongs to */
  projectId: string;

  /** Configuration schema — what users can customize */
  configSchema: ComponentConfigSchema;
  /** Credential schema — what credentials the component needs */
  credentialSchema: ComponentCredentialSchema;
  /** Input schema — what data the component accepts */
  inputSchema: ComponentIoSchema;
  /** Output schema — what data the component produces */
  outputSchema: ComponentIoSchema;

  /** The actual component implementation (JSON) */
  implementation: ComponentImplementation;

  /** Metadata */
  metadata: ComponentMetadata;
}

/** Configuration schema for user-configurable options */
export interface ComponentConfigSchema {
  type: 'object';
  properties: Record<string, ComponentConfigProperty>;
  required?: string[];
}

export interface ComponentConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  displayName: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}

/** Credential schema — what external services the component needs */
export interface ComponentCredentialSchema {
  /** Required credential types */
  required: Array<{
    type: string;
    displayName: string;
    description: string;
    optional?: boolean;
  }>;
}

/** Input/Output schema declaration */
export interface ComponentIoSchema {
  type: 'object';
  properties: Record<
    string,
    {
      type: string;
      displayName: string;
      description?: string;
    }
  >;
}

/** The actual component implementation */
export interface ComponentImplementation {
  /** Implementation type */
  type: 'workflow' | 'node' | 'function';
  /** For workflow type: the workflow definition */
  workflow?: Record<string, unknown>;
  /** For node type: the node type and parameters */
  node?: {
    type: string;
    parameters: Record<string, unknown>;
  };
  /** For function type: the function definition */
  function?: {
    code: string;
    runtime: string;
  };
}

/** Component metadata */
export interface ComponentMetadata {
  /** When the component was first created */
  createdAt: Date;
  /** When the component was last updated */
  updatedAt: Date;
  /** Total number of versions */
  versionCount: number;
  /** Number of projects using this component (future) */
  usageCount: number;
  /** License identifier */
  license?: string;
  /** Repository URL */
  repository?: string;
  /** Documentation URL */
  documentation?: string;
}

/** A version snapshot of a component */
export interface ComponentVersion {
  id: string;
  componentId: string;
  version: string;
  /** Snapshot of the component definition at this version */
  definition: O<ComponentDefinition, 'id' | 'metadata'>;
  /** Changelog for this version */
  changelog?: string;
  createdAt: Date;
}
```

### Component Registry (Framework-Independent)

```typescript
// packages/workflow-core/src/component-system/component-registry.ts

export class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();

  /** Register a component */
  register(component: ComponentDefinition): void;

  /** Get a component by ID */
  get(id: string): ComponentDefinition | undefined;

  /** Get a component by name within a project */
  getByName(projectId: string, name: string): ComponentDefinition | undefined;

  /** Check if a component exists */
  has(id: string): boolean;

  /** Get all components */
  getAll(): ComponentDefinition[];

  /** Get components by project */
  getByProject(projectId: string): ComponentDefinition[];

  /** Get components by category */
  getByCategory(category: string): ComponentDefinition[];

  /** Get components by status */
  getByStatus(status: ComponentStatus): ComponentDefinition[];

  /** Search components by query */
  search(query: string): ComponentDefinition[];

  /** Validate a component definition */
  validate(component: Partial<ComponentDefinition>): ValidationResult;
}
```

### Component Versioning Strategy

Components use **semantic versioning** (MAJOR.MINOR.PATCH):

| Change Type               | Version Bump | Example       |
| ------------------------- | ------------ | ------------- |
| Bug fix, metadata change  | PATCH        | 1.0.0 → 1.0.1 |
| New feature, non-breaking | MINOR        | 1.0.0 → 1.1.0 |
| Breaking change           | MAJOR        | 1.0.0 → 2.0.0 |

Version history is stored separately to allow rollback and comparison.

### API Endpoints

| Method | Path                                                           | Description                          |
| ------ | -------------------------------------------------------------- | ------------------------------------ |
| POST   | `/api/v1/projects/:projectId/components`                       | Create component                     |
| GET    | `/api/v1/projects/:projectId/components`                       | List components (with search/filter) |
| GET    | `/api/v1/projects/:projectId/components/:id`                   | Get component                        |
| PATCH  | `/api/v1/projects/:projectId/components/:id`                   | Update component                     |
| DELETE | `/api/v1/projects/:projectId/components/:id`                   | Delete component                     |
| POST   | `/api/v1/projects/:projectId/components/:id/versions`          | Create new version                   |
| GET    | `/api/v1/projects/:projectId/components/:id/versions`          | List versions                        |
| GET    | `/api/v1/projects/:projectId/components/:id/versions/:version` | Get version                          |
| POST   | `/api/v1/projects/:projectId/components/:id/clone`             | Clone component                      |

### Database Schema

```prisma
model Component {
  id            String   @id @default(uuid())
  projectId     String   @map("project_id")
  name          String
  displayName   String   @map("display_name")
  description   String?
  version       String   @default("1.0.0")
  status        String   @default("draft")
  category      String?
  tags          String[] // PostgreSQL array
  author        String?
  configSchema  Json     @map("config_schema")
  credentialSchema Json @map("credential_schema")
  inputSchema   Json     @map("input_schema")
  outputSchema  Json     @map("output_schema")
  implementation Json
  metadata      Json?
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  project  Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  versions ComponentVersion[]

  @@unique([projectId, name])
  @@index([projectId])
  @@index([category])
  @@index([status])
  @@map("components")
}

model ComponentVersion {
  id           String   @id @default(uuid())
  componentId  String   @map("component_id")
  version      String
  definition   Json     // Snapshot of component at this version
  changelog    String?
  createdAt    DateTime @default(now()) @map("created_at")

  component Component @relation(fields: [componentId], references: [id], onDelete: Cascade)

  @@unique([componentId, version])
  @@index([componentId])
  @@map("component_versions")
}
```

### File Structure

#### packages/workflow-core (framework-independent)

```
packages/workflow-core/src/
├── component-system/
│   ├── component-types.ts           # ComponentDefinition, ComponentVersion, etc.
│   ├── component-registry.ts        # In-memory component registry
│   ├── component-registry.spec.ts   # Tests
│   ├── component-validator.ts       # Component validation logic
│   ├── component-validator.spec.ts  # Tests
│   └── index.ts                     # Barrel export
```

#### apps/api (NestJS)

```
apps/api/src/
├── modules/
│   └── components/
│       ├── components.module.ts
│       ├── components.service.ts    # Component CRUD + versioning
│       ├── components.controller.ts # REST API endpoints
│       ├── components.service.spec.ts
│       ├── components.controller.spec.ts
│       └── dto/
│           ├── create-component.dto.ts
│           ├── update-component.dto.ts
│           ├── component-response.dto.ts
│           ├── component-query.dto.ts
│           └── index.ts
├── app.module.ts                    # Updated with ComponentsModule
```

## Dependencies

### New Dependencies

None. Uses:

- Existing Prisma client
- Existing `@devflow/workflow-core` infrastructure
- Node.js built-in crypto (for future component sharing signatures)

### Updated Dependencies

None.

## Environment Variables

| Variable | Required | Description                         |
| -------- | -------- | ----------------------------------- |
| None     | —        | No new environment variables needed |

## Security Considerations

| Concern                       | Mitigation                            |
| ----------------------------- | ------------------------------------- |
| Component name collision      | Unique constraint per project         |
| Invalid component definitions | Validation on create/update           |
| Version manipulation          | Version auto-incremented or validated |
| Large component definitions   | Size limits on JSON fields            |
| Cross-project access          | Project-scoped queries                |

## Testing Strategy

### Unit Tests (workflow-core)

- **ComponentRegistry:**
  - Registers and retrieves components
  - Validates component definitions
  - Filters by project, category, status
  - Searches by query string
  - Rejects duplicate names within project

- **ComponentValidator:**
  - Validates required fields
  - Validates version format (semver)
  - Validates config schema structure
  - Validates credential schema structure

### Unit Tests (API)

- **ComponentsService:**
  - Creates components with validation
  - Lists components with pagination and search
  - Updates components
  - Deletes components
  - Creates and retrieves versions
  - Clones components

- **ComponentsController:**
  - All CRUD endpoints work
  - Pagination works
  - Search works
  - Validation rejects invalid input

### Integration Tests

- Complete component lifecycle (create → update → version → clone → delete)
- Component search and filtering
- Version history management
- Validation error handling

## Verification Commands

```bash
# Run all tests
pnpm test

# Run workflow-core tests
cd packages/workflow-core && pnpm test

# Run API tests
cd apps/api && ENCRYPTION_KEY=<key> pnpm test

# Typecheck
pnpm typecheck

# Lint
pnpm lint
```

## Risks

| Risk                       | Likelihood | Impact | Mitigation                   |
| -------------------------- | ---------- | ------ | ---------------------------- |
| Large JSON definitions     | Medium     | Low    | Size limits, compression     |
| Version history growth     | Medium     | Low    | TTL-based cleanup (future)   |
| Complex validation schemas | Medium     | Medium | Start simple, extend later   |
| Cross-project components   | Low        | Medium | Future feature, not in scope |
| Component dependency graph | Low        | High   | Future feature, not in scope |

## How Components Are Used (Future)

In future phases, components will be:

1. **Referenced by workflows** — A workflow can use a component as a "super-node"
2. **Previewed** — Execute component with test data
3. **Tested** — Run component tests
4. **Code-generated** — Export to Laravel, NestJS, etc.
5. **Shared** — Publish to a component registry (future)

## Completion Checklist

- [x] Plan approved by human
- [x] Prisma schema updated with Component and ComponentVersion models
- [x] ComponentTypes defined (framework-independent)
- [x] ComponentRegistry implemented
- [x] ComponentValidator implemented
- [x] ComponentsModule created in API
- [x] ComponentsService implemented
- [x] ComponentsController implemented
- [x] DTOs created with Swagger decorators
- [x] API endpoints work
- [x] Unit tests pass
- [x] Integration tests pass
- [x] `pnpm test` passes (320 workflow-core + 145 API = 465 total)
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Documentation updated
