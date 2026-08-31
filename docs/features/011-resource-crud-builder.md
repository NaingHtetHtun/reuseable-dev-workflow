# 011 — Resource / CRUD Builder

## Status

**IMPLEMENTED** — All verification criteria met.

## Goal

Define a resource definition system that captures entity structure (fields, types, constraints) and generates validation rules and Prisma schema from those definitions. Resources are the structured "what" that later phases (10-12) will use to generate framework-specific code.

## Problem

Developers repeatedly build the same CRUD entities (users, posts, categories, etc.) with the same patterns: database schema, validation rules, API endpoints. A structured resource definition should be the single source of truth that eliminates this repetition.

Currently there is no way to:

- Define a resource with typed fields and constraints in a structured format
- Validate resource definitions against a schema
- Generate Prisma schema from a resource definition
- Generate validation rules (class-validator) from a resource definition
- Manage resource definitions via API
- Version resource definitions like components

## Scope

### In Scope

1. **Resource definition format** — Framework-independent JSON schema for resources (name, fields, types, constraints, relationships)
2. **Field type system** — Built-in field types: string, text, boolean, integer, float, timestamp, json, enum, relation
3. **Field constraints** — Required, unique, default value, min/max length, min/max value, pattern, enum values
4. **Resource validator** — Validates resource definitions against the schema
5. **Prisma schema generator** — Generates Prisma model from a resource definition
6. **Validation rule generator** — Generates class-validator decorators from field definitions
7. **Resource entity** — Prisma model for storing resource definitions
8. **Resource CRUD API** — Create, read, update, delete resource definitions
9. **Resource versioning** — Version snapshots (reuses ComponentVersion pattern)
10. **Unit and integration tests** — Full test coverage

### Non-Goals

- ❌ Visual resource editor (UI) — future
- ❌ UI generation (forms, tables) — future
- ❌ NestJS module/controller/service generation — Phase 10+
- ❌ Laravel model/migration generation — Phase 11
- ❌ Relationship handling beyond basic foreign keys — future
- ❌ Custom field types — future
- ❌ Resource execution/runtime — resources are definitions, not runtimes

## Architecture

### Design Principles

1. **Framework-independent** — Resource definitions live in `packages/workflow-core`
2. **Single source of truth** — All outputs (Prisma, validation) derive from the definition
3. **Composable** — Resources reference other resources via relations
4. **Project-scoped** — Resources belong to projects (can be made global later)
5. **Versioned** — Every change creates a version snapshot

### Resource Definition Format

```typescript
// packages/workflow-core/src/resource-system/resource-types.ts

/** Resource field types */
export type FieldType =
  | 'string' // VARCHAR(255)
  | 'text' // TEXT
  | 'boolean' // BOOLEAN
  | 'integer' // INTEGER
  | 'float' // FLOAT/DOUBLE
  | 'timestamp' // TIMESTAMP
  | 'json' // JSON
  | 'enum' // ENUM
  | 'relation'; // Foreign key

/** A field in a resource definition */
export interface ResourceField {
  /** Field name (snake_case) */
  name: string;
  /** Display name */
  displayName: string;
  /** Field type */
  type: FieldType;
  /** Whether the field is required */
  required: boolean;
  /** Whether the field is unique */
  unique?: boolean;
  /** Default value */
  default?: unknown;
  /** Description */
  description?: string;

  // Type-specific constraints
  /** For string/text: min length */
  minLength?: number;
  /** For string/text: max length */
  maxLength?: number;
  /** For integer/float: minimum value */
  minimum?: number;
  /** For integer/float: maximum value */
  maximum?: number;
  /** For string: regex pattern */
  pattern?: string;
  /** For enum: allowed values */
  enum?: string[];
  /** For relation: target resource name */
  relationResource?: string;
  /** For relation: relation type */
  relationType?: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

/** A resource definition */
export interface ResourceDefinition {
  /** Unique identifier (auto-generated) */
  id: string;
  /** Resource name (PascalCase, unique within project) */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Description */
  description?: string;
  /** Version (semver) */
  version: string;
  /** Status */
  status: ResourceStatus;
  /** Project ID */
  projectId: string;
  /** Table name override (default: snake_case of name) */
  tableName?: string;
  /** Fields */
  fields: ResourceField[];
  /** Metadata */
  metadata: ResourceMetadata;
}

/** Resource status */
export type ResourceStatus = 'draft' | 'published' | 'deprecated';

/** Resource metadata */
export interface ResourceMetadata {
  createdAt: Date;
  updatedAt: Date;
  versionCount: number;
}

/** A version snapshot of a resource */
export interface ResourceVersion {
  id: string;
  resourceId: string;
  version: string;
  definition: Omit<ResourceDefinition, 'id' | 'metadata'>;
  changelog?: string;
  createdAt: Date;
}

/** Input for creating a resource */
export interface CreateResourceInput {
  name: string;
  displayName: string;
  description?: string;
  tableName?: string;
  fields: ResourceField[];
}

/** Input for updating a resource */
export interface UpdateResourceInput {
  displayName?: string;
  description?: string;
  tableName?: string;
  fields?: ResourceField[];
  status?: ResourceStatus;
}

/** Validation result */
export interface ResourceValidationResult {
  valid: boolean;
  errors: string[];
}
```

### Resource Validator

```typescript
// packages/workflow-core/src/resource-system/resource-validator.ts

export class ResourceValidator {
  /** Validate a full resource definition */
  validateResource(resource: Partial<ResourceDefinition>): ResourceValidationResult;

  /** Validate a single field */
  validateField(field: ResourceField): ResourceValidationResult;

  /** Validate field constraints for a given type */
  validateFieldConstraints(field: ResourceField): ResourceValidationResult;
}
```

Validation rules:

- Resource name must be PascalCase (e.g., `Category`, `BlogPost`)
- Resource name must be unique within project
- At least one field required
- Field names must be snake_case
- Field type must be valid
- Required fields cannot have default values (optional, not enforced)
- Enum fields must have enum values
- Relation fields must have relationResource
- String maxLength must be >= minLength
- Integer/float maximum must be >= minimum

### Prisma Schema Generator

```typescript
// packages/workflow-core/src/resource-system/prisma-generator.ts

export class PrismaGenerator {
  /** Generate a Prisma model string from a resource definition */
  generateModel(resource: ResourceDefinition): string;

  /** Generate the full Prisma schema for a list of resources */
  generateSchema(resources: ResourceDefinition[]): string;
}

// Field type → Prisma type mapping:
// string   → String
// text     → String
// boolean  → Boolean
// integer  → Int
// float    → Float
// timestamp → DateTime
// json     → Json
// enum     → String (with @@enum or enum block)
// relation → String (with @relation)
```

### Validation Rule Generator

```typescript
// packages/workflow-core/src/resource-system/validation-generator.ts

export class ValidationGenerator {
  /** Generate class-validator decorators for a resource field */
  generateFieldDecorators(field: ResourceField): string[];

  /** Generate a complete DTO class string for a resource */
  generateDto(resource: ResourceDefinition, operation: 'create' | 'update' | 'response'): string;
}
```

Generated validation rules:

- `required` → `@IsNotEmpty()` / `@IsOptional()`
- `string` with maxLength → `@MaxLength(n)`
- `string` with minLength → `@MinLength(n)`
- `string` with pattern → `@Matches(/pattern/)`
- `integer` → `@IsInt()`
- `float` → `@IsNumber()`
- `boolean` → `@IsBoolean()`
- `enum` → `@IsIn([...])`
- `timestamp` → `@IsDateString()`
- `json` → `@IsObject()`

### API Endpoints

| Method | Path                                                            | Description                         |
| ------ | --------------------------------------------------------------- | ----------------------------------- |
| POST   | `/api/v1/projects/:projectId/resources`                         | Create resource definition          |
| GET    | `/api/v1/projects/:projectId/resources`                         | List resources (with search/filter) |
| GET    | `/api/v1/projects/:projectId/resources/:id`                     | Get resource definition             |
| PATCH  | `/api/v1/projects/:projectId/resources/:id`                     | Update resource definition          |
| DELETE | `/api/v1/projects/:projectId/resources/:id`                     | Delete resource definition          |
| POST   | `/api/v1/projects/:projectId/resources/:id/versions`            | Create version snapshot             |
| GET    | `/api/v1/projects/:projectId/resources/:id/versions`            | List versions                       |
| GET    | `/api/v1/projects/:projectId/resources/:id/versions/:version`   | Get specific version                |
| POST   | `/api/v1/projects/:projectId/resources/:id/generate/prisma`     | Preview generated Prisma model      |
| POST   | `/api/v1/projects/:projectId/resources/:id/generate/validation` | Preview generated validation DTO    |

### Database Schema

```prisma
model Resource {
  id          String   @id @default(uuid())
  projectId   String   @map("project_id")
  name        String
  displayName String   @map("display_name")
  description String?
  tableName   String?  @map("table_name")
  version     String   @default("1.0.0")
  status      String   @default("draft")
  fields      Json     // ResourceField[] as JSON
  metadata    Json?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  project  Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  versions ResourceVersion[]

  @@unique([projectId, name])
  @@index([projectId])
  @@map("resources")
}

model ResourceVersion {
  id          String   @id @default(uuid())
  resourceId  String   @map("resource_id")
  version     String
  definition  Json     // Snapshot of resource at this version
  changelog   String?
  createdAt   DateTime @default(now()) @map("created_at")

  resource Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  @@unique([resourceId, version])
  @@index([resourceId])
  @@map("resource_versions")
}
```

### File Structure

#### packages/workflow-core (framework-independent)

```
packages/workflow-core/src/
├── resource-system/
│   ├── resource-types.ts            # ResourceDefinition, ResourceField, etc.
│   ├── resource-validator.ts        # Resource definition validation
│   ├── resource-validator.spec.ts   # Tests
│   ├── prisma-generator.ts          # Prisma schema generation
│   ├── prisma-generator.spec.ts     # Tests
│   ├── validation-generator.ts      # class-validator DTO generation
│   ├── validation-generator.spec.ts # Tests
│   └── index.ts                     # Barrel export
├── index.ts                         # Updated exports
```

#### apps/api (NestJS)

```
apps/api/src/
├── modules/
│   └── resources/
│       ├── resources.module.ts
│       ├── resources.service.ts      # CRUD + versioning + generation preview
│       ├── resources.controller.ts   # REST API endpoints
│       ├── resources.service.spec.ts
│       ├── resources.controller.spec.ts
│       └── dto/
│           ├── create-resource.dto.ts
│           ├── update-resource.dto.ts
│           ├── resource-response.dto.ts
│           └── index.ts
├── app.module.ts                    # Updated with ResourcesModule
```

## Dependencies

### New Dependencies

None. Uses:

- Existing Prisma client
- Existing `@devflow/workflow-core` infrastructure

### Updated Dependencies

None.

## Environment Variables

| Variable | Required | Description                         |
| -------- | -------- | ----------------------------------- |
| None     | —        | No new environment variables needed |

## Security Considerations

| Concern                      | Mitigation                        |
| ---------------------------- | --------------------------------- |
| Resource name collision      | Unique constraint per project     |
| Invalid resource definitions | Validation on create/update       |
| Large field definitions      | Size limits on JSON fields        |
| Generated code injection     | Sanitize names, validate patterns |
| Cross-project access         | Project-scoped queries            |

## Testing Strategy

### Unit Tests (workflow-core)

- **ResourceValidator:**
  - Validates PascalCase resource names
  - Validates snake_case field names
  - Validates required fields exist
  - Validates field type constraints
  - Validates enum fields have values
  - Validates relation fields have target
  - Rejects invalid field types
  - Rejects duplicate field names

- **PrismaGenerator:**
  - Generates correct Prisma model for simple resource
  - Maps all field types correctly
  - Handles required/optional fields
  - Handles unique constraints
  - Handles default values
  - Handles enum fields
  - Handles relation fields
  - Generates valid Prisma schema string

- **ValidationGenerator:**
  - Generates correct decorators for each field type
  - Handles required vs optional fields
  - Handles string constraints (minLength, maxLength, pattern)
  - Handles numeric constraints (minimum, maximum)
  - Generates create/update/response DTOs

### Unit Tests (API)

- **ResourcesService:**
  - Creates resources with validation
  - Lists resources with pagination and search
  - Updates resources
  - Deletes resources
  - Creates and retrieves versions
  - Generates Prisma preview
  - Generates validation preview

- **ResourcesController:**
  - All CRUD endpoints work
  - Pagination works
  - Search works
  - Validation rejects invalid input
  - Generation endpoints return results

### Integration Tests

- Complete resource lifecycle (create → update → version → generate → delete)
- Resource search and filtering
- Version history management
- Prisma generation preview
- Validation generation preview

## Verification Commands

```bash
# Run all tests
pnpm test

# Run workflow-core tests
cd packages/workflow-core && pnpm test

# Run API tests
cd apps/api && ENCRYPTION_KEY=<64-char-hex> pnpm test

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
```

## Risks

| Risk                          | Likelihood | Impact | Mitigation                                     |
| ----------------------------- | ---------- | ------ | ---------------------------------------------- |
| Complex relation handling     | Medium     | Medium | Start with basic FK, extend later              |
| Prisma schema conflicts       | Low        | Medium | Validate before generating                     |
| Generated validation mismatch | Medium     | Low    | Test generated DTOs explicitly                 |
| Field type extensibility      | Low        | Medium | Start with built-in types, plugin system later |
| Resource definition drift     | Low        | Low    | Versioning + snapshots                         |

## How Resources Are Used (Future)

In future phases, resources will be:

1. **Code-generated** — Export to NestJS modules (Phase 10+), Laravel models (Phase 11)
2. **Previewed** — See generated Prisma schema and validation DTOs
3. **Used in workflows** — Resources as data sources/sinks in workflow nodes
4. **UI-generated** — Forms and tables from resource definitions
5. **Tested** — Generated code must pass typecheck/lint

## Completion Checklist

- [x] Plan approved by human
- [x] Prisma schema updated with Resource and ResourceVersion models
- [x] ResourceTypes defined (framework-independent)
- [x] ResourceValidator implemented
- [x] PrismaGenerator implemented
- [x] ValidationGenerator implemented
- [x] ResourcesModule created in API
- [x] ResourcesService implemented
- [x] ResourcesController implemented
- [x] DTOs created with Swagger decorators
- [x] API endpoints work
- [x] Generation preview endpoints work
- [x] Unit tests pass (55 workflow-core + 36 API)
- [x] `pnpm test` passes (557 total)
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] `pnpm format` passes
- [x] Documentation updated
