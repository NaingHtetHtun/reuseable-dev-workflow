# 012 — Code Generation Engine

## Status

**IMPLEMENTED** — All verification criteria met.

## Goal

Build a framework-independent code generation engine that consumes application definitions (resources, components) and produces framework-specific code through a compiler pipeline with pluggable adapters and templates.

## Problem

The platform has rich definitions (resources with fields, components with schemas) but no way to turn them into working code. Developers need to manually translate definitions into framework code. A code generation engine eliminates this gap by producing valid, ready-to-use code from structured definitions.

## Scope

### In Scope

1. **Application definition format** — Unified, framework-independent description combining resources and components
2. **Compiler pipeline** — Orchestrates: definition → adapter → templates → generated files
3. **Template engine** — Simple string-based template rendering with variable interpolation (no external dependencies)
4. **Framework adapter interface** — Interface that framework-specific adapters implement
5. **Generated file abstraction** — `GeneratedFile` type representing output files (path + content)
6. **A plain-typescript reference adapter** — Generates TypeScript interfaces and types from resources (proves the pipeline works, useful on its own)
7. **Compilation result** — Structured output with generated files, warnings, and metadata
8. **API endpoint** — Preview generated code for a project's resources
9. **Unit and integration tests** — Full test coverage

### Non-Goals

- ❌ Laravel generator — Phase 11
- ❌ NestJS generator — Phase 12
- ❌ Visual code preview UI — future
- ❌ Code diff preview — future
- ❌ Incremental generation — future
- ❌ AST manipulation — future (templates are sufficient for now)
- ❌ Project scaffolding (package.json, configs) — future

## Architecture

### Design Principles

1. **Framework-independent core** — No Laravel/NestJS specifics in the engine
2. **Pluggable adapters** — Add new frameworks by implementing the adapter interface
3. **Template-based** — Simple string templates, not AST manipulation
4. **Composable** — Multiple adapters can run on the same definition
5. **Testable output** — Generated code must be valid TypeScript

### Application Definition

```typescript
// packages/workflow-core/src/codegen-system/codegen-types.ts

/** Target framework for code generation */
export type Framework = 'typescript' | 'laravel' | 'nestjs';

/** A generated file */
export interface GeneratedFile {
  /** Relative file path (e.g., 'types/category.ts') */
  path: string;
  /** File content */
  content: string;
  /** File description for documentation */
  description?: string;
}

/** Compilation options */
export interface CompilationOptions {
  /** Target framework */
  framework: Framework;
  /** Framework version (e.g., '12' for Laravel, '10' for NestJS) */
  version?: string;
  /** Output directory prefix */
  outputPrefix?: string;
  /** Whether to include comments in generated code */
  includeComments?: boolean;
}

/** Result of a compilation */
export interface CompilationResult {
  /** Whether compilation succeeded */
  success: boolean;
  /** Generated files */
  files: GeneratedFile[];
  /** Compilation warnings (non-fatal) */
  warnings: string[];
  /** Compilation errors (fatal) */
  errors: string[];
  /** Metadata about the compilation */
  metadata: {
    framework: Framework;
    version?: string;
    resourceCount: number;
    componentCount: number;
    fileCount: number;
    generatedAt: Date;
  };
}

/** Application definition — unified input for the compiler */
export interface ApplicationDefinition {
  /** Application name */
  name: string;
  /** Description */
  description?: string;
  /** Resources to generate code for */
  resources: ResourceDefinitionForCodegen[];
  /** Components to generate code for */
  components: ComponentDefinitionForCodegen[];
}

/** Simplified resource definition for codegen (avoids circular deps) */
export interface ResourceDefinitionForCodegen {
  name: string;
  displayName: string;
  description?: string;
  tableName?: string;
  fields: ResourceFieldForCodegen[];
}

/** Simplified field definition for codegen */
export interface ResourceFieldForCodegen {
  name: string;
  displayName: string;
  type: string;
  required: boolean;
  unique?: boolean;
  default?: unknown;
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enum?: string[];
  relationResource?: string;
  relationType?: string;
}

/** Simplified component definition for codegen */
export interface ComponentDefinitionForCodegen {
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}
```

### Framework Adapter Interface

```typescript
// packages/workflow-core/src/codegen-system/framework-adapter.ts

export interface FrameworkAdapter {
  /** Framework identifier */
  readonly framework: Framework;

  /** Generate code from an application definition */
  compile(definition: ApplicationDefinition, options: CompilationOptions): CompilationResult;

  /** Get supported file extensions for this framework */
  getFileExtensions(): string[];
}
```

### Template Engine

```typescript
// packages/workflow-core/src/codegen-system/template-engine.ts

export class TemplateEngine {
  /**
   * Render a template string with variable interpolation.
   * Uses {{variable}} syntax.
   *
   * Example:
   *   render('export interface {{name}} { {{fields}} }', { name: 'Category', fields: '...' })
   */
  render(template: string, context: Record<string, unknown>): string;

  /**
   * Render a template with conditional sections.
   * Uses {{#if condition}}...{{/if}} syntax.
   */
  renderWithConditionals(template: string, context: Record<string, unknown>): string;

  /**
   * Render a template with loops.
   * Uses {{#each items}}...{{/each}} syntax.
   */
  renderWithLoops(template: string, context: Record<string, unknown>): string;
}
```

### Compiler Pipeline

```typescript
// packages/workflow-core/src/codegen-system/compiler.ts

export class Compiler {
  private adapters = new Map<Framework, FrameworkAdapter>();
  private templateEngine: TemplateEngine;

  /** Register a framework adapter */
  registerAdapter(adapter: FrameworkAdapter): void;

  /** Compile an application definition for a target framework */
  compile(definition: ApplicationDefinition, options: CompilationOptions): CompilationResult;

  /** Get available frameworks */
  getAvailableFrameworks(): Framework[];
}
```

### Plain TypeScript Adapter (Reference Implementation)

Generates TypeScript interfaces and types from resource definitions:

```typescript
// For a "Category" resource with fields: name (string, required), description (text, optional), active (boolean, required)
// Generates:

// types/category.ts
export interface Category {
  name: string;
  description?: string;
  active: boolean;
}

export type CategoryCreateInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type CategoryUpdateInput = Partial<CategoryCreateInput>;
```

This adapter:

- Proves the pipeline works end-to-end
- Is useful on its own (generates TypeScript types)
- Serves as a reference for future framework adapters
- No external dependencies

### API Endpoints

| Method | Path                                                      | Description                                  |
| ------ | --------------------------------------------------------- | -------------------------------------------- |
| POST   | `/api/v1/projects/:projectId/codegen/preview`             | Preview generated code for all resources     |
| POST   | `/api/v1/projects/:projectId/codegen/preview/:resourceId` | Preview generated code for a single resource |

Request body:

```json
{
  "framework": "typescript",
  "version": "5.0",
  "includeComments": true
}
```

Response:

```json
{
  "success": true,
  "files": [
    {
      "path": "types/category.ts",
      "content": "export interface Category { ... }",
      "description": "TypeScript interface for Category"
    }
  ],
  "warnings": [],
  "errors": [],
  "metadata": {
    "framework": "typescript",
    "resourceCount": 1,
    "componentCount": 0,
    "fileCount": 1,
    "generatedAt": "2026-09-01T00:00:00.000Z"
  }
}
```

### File Structure

#### packages/workflow-core (framework-independent)

```
packages/workflow-core/src/
├── codegen-system/
│   ├── codegen-types.ts              # ApplicationDefinition, GeneratedFile, etc.
│   ├── framework-adapter.ts          # FrameworkAdapter interface
│   ├── template-engine.ts            # String template rendering
│   ├── template-engine.spec.ts       # Tests
│   ├── compiler.ts                   # Compiler pipeline
│   ├── compiler.spec.ts              # Tests
│   ├── adapters/
│   │   ├── typescript/
│   │   │   ├── typescript.adapter.ts     # Plain TypeScript adapter
│   │   │   ├── typescript.adapter.spec.ts # Tests
│   │   │   └── templates.ts              # Template strings
│   │   └── index.ts                      # Adapter registry
│   └── index.ts                     # Barrel export
├── index.ts                         # Updated exports
```

#### apps/api (NestJS)

```
apps/api/src/
├── modules/
│   └── codegen/
│       ├── codegen.module.ts
│       ├── codegen.service.ts        # Orchestrates compilation
│       ├── codegen.controller.ts     # API endpoints
│       ├── codegen.service.spec.ts
│       ├── codegen.controller.spec.ts
│       └── dto/
│           ├── codegen-preview.dto.ts
│           └── index.ts
├── app.module.ts                    # Updated with CodegenModule
```

## Dependencies

### New Dependencies

None. Uses:

- Existing `@devflow/workflow-core` infrastructure
- No template libraries (custom simple engine)

### Updated Dependencies

None.

## Environment Variables

| Variable | Required | Description                         |
| -------- | -------- | ----------------------------------- |
| None     | —        | No new environment variables needed |

## Security Considerations

| Concern                  | Mitigation                       |
| ------------------------ | -------------------------------- |
| Generated code injection | Sanitize resource/field names    |
| Large definitions        | Size limits on compilation input |
| Resource exhaustion      | Timeout on compilation           |
| Cross-project access     | Project-scoped queries           |

## Testing Strategy

### Unit Tests (workflow-core)

- **TemplateEngine:**
  - Renders simple variable interpolation
  - Renders conditional sections
  - Renders loops
  - Handles missing variables gracefully
  - Escapes special characters

- **Compiler:**
  - Compiles with registered adapter
  - Returns error for unregistered framework
  - Passes options to adapter
  - Validates definition before compilation

- **TypeScriptAdapter:**
  - Generates interface for simple resource
  - Handles optional fields
  - Handles all field types
  - Generates CreateInput/UpdateInput types
  - Handles multiple resources
  - Includes comments when requested

### Unit Tests (API)

- **CodegenService:**
  - Compiles project resources
  - Handles missing resources
  - Handles empty project

- **CodegenController:**
  - Preview endpoint works
  - Returns proper HTTP status codes

### Integration Tests

- Complete code generation flow (project → resources → compile → files)
- Multiple resources in one compilation
- Error handling for invalid definitions

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

| Risk                            | Likelihood | Impact | Mitigation                                 |
| ------------------------------- | ---------- | ------ | ------------------------------------------ |
| Template complexity grows       | Medium     | Medium | Keep templates simple, extensible later    |
| Framework adapter maintenance   | Medium     | Low    | Start with one adapter, add incrementally  |
| Generated code quality          | Medium     | Medium | Test generated output rigorously           |
| Circular dependencies           | Low        | High   | Use simplified type interfaces for codegen |
| Performance with many resources | Low        | Low    | Lazy generation, caching (future)          |

## How This Connects to Future Phases

- **Phase 11 (Laravel)** — Implements `FrameworkAdapter` for Laravel v12
- **Phase 12 (NestJS)** — Implements `FrameworkAdapter` for NestJS v10
- **Future** — AST manipulation, incremental generation, visual preview

## Completion Checklist

- [x] Plan approved by human
- [x] CodegenTypes defined (framework-independent)
- [x] FrameworkAdapter interface defined
- [x] TemplateEngine implemented
- [x] Compiler pipeline implemented
- [x] TypeScriptAdapter implemented (reference)
- [x] CodegenModule created in API
- [x] CodegenService implemented
- [x] CodegenController implemented
- [x] DTOs created with Swagger decorators
- [x] API endpoints work
- [x] Generated TypeScript code is valid
- [x] Unit tests pass (41 workflow-core + 11 API)
- [x] `pnpm test` passes (609 total)
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] `pnpm format` passes
- [x] Documentation updated
