# 009 — Preview System

## Status

**IMPLEMENTED** — All verification criteria met.

## Goal

Allow developers to visually or practically verify features before deploying. Provide Swagger/OpenAPI documentation, workflow preview with test data, and an isolated preview sandbox.

## Problem

Currently, there is no way to:
- View API documentation interactively (no Swagger/OpenAPI)
- Test workflows with sample data without executing them in production
- Inspect workflow behavior step-by-step before deployment
- Verify component configurations before committing

This increases the feedback loop — developers must deploy to test, rather than previewing locally.

## Scope

### In Scope

1. **Swagger/OpenAPI integration** — Interactive API documentation at `/api/docs`
2. **Workflow preview** — Execute a workflow definition with test data in a sandboxed context
3. **Workflow step-by-step preview** — Inspect each node's input/output without full execution
4. **Preview sandbox** — Isolated execution context that doesn't affect production data
5. **Preview state management** — Store and retrieve preview results
6. **Preview DTO** — Request/response types for preview endpoints
7. **Node preview** — Execute a single node with test input
8. **Definition validation preview** — Validate workflow definition and return detailed diagnostics
9. **API endpoints** — Preview management and execution
10. **Unit tests** — Full test coverage for preview logic

### Non-Goals

- ❌ Live UI preview (React frontend preview)
- ❌ Hot reload preview
- ❌ Preview deployment (staging environments)
- ❌ Preview sharing between users
- ❌ Visual workflow builder preview
- ❌ Component preview (Phase 6 not completed yet)
- ❌ Real-time preview updates

## Architecture

### Design Principles

1. **Sandboxed execution** — Preview runs in isolated context, never touches production
2. **Framework-independent** — Preview logic in `packages/workflow-core`
3. **Non-destructive** — Preview results are ephemeral or explicitly stored
4. **Composable** — Preview can validate, execute single nodes, or run full workflows
5. **Safe by default** — HTTP requests in preview use mock responses unless explicitly enabled

### Preview Types

```typescript
// packages/workflow-core/src/preview-system/preview-types.ts

/** Preview mode — how the workflow should be previewed */
export type PreviewMode = 'validate' | 'dry-run' | 'execute' | 'step';

/** Request to preview a workflow */
export interface WorkflowPreviewRequest {
  /** Workflow definition to preview */
  definition: WorkflowDefinition;
  /** Preview mode */
  mode: PreviewMode;
  /** Test input data */
  input?: unknown;
  /** Node ID to preview (for 'step' mode) */
  nodeId?: string;
  /** Options for the preview */
  options?: PreviewOptions;
}

/** Options controlling preview behavior */
export interface PreviewOptions {
  /** Maximum execution time in ms (default: 30000) */
  timeoutMs?: number;
  /** Whether to actually execute HTTP requests (default: false — mocks them) */
  executeHttp?: boolean;
  /** Whether to execute delays (default: false — skips them) */
  executeDelays?: boolean;
  /** Maximum nodes to execute (default: all) */
  maxNodes?: number;
}

/** Result of a workflow preview */
export interface WorkflowPreviewResult {
  /** Whether the preview succeeded */
  success: boolean;
  /** Preview mode used */
  mode: PreviewMode;
  /** Validation errors (if any) */
  validationErrors: string[];
  /** Node execution results (step-by-step) */
  nodeResults: PreviewNodeResult[];
  /** Final output (if execute mode) */
  output: unknown;
  /** Execution time in ms */
  durationMs: number;
  /** Warnings (non-fatal issues) */
  warnings: string[];
}

/** Result of a single node preview */
export interface PreviewNodeResult {
  /** Node ID */
  nodeId: string;
  /** Node type */
  nodeType: string;
  /** Node name */
  nodeName: string;
  /** Input received by this node */
  input: unknown;
  /** Output produced by this node */
  output: unknown;
  /** Whether this node executed successfully */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Execution time in ms */
  durationMs: number;
}
```

### Preview Executor

```typescript
// packages/workflow-core/src/preview-system/preview-executor.ts

export class PreviewExecutor {
  constructor(
    private readonly workflowExecutor: WorkflowExecutor,
    private readonly logger: Logger,
  ) {}

  /**
   * Execute a workflow preview.
   */
  async preview(
    request: WorkflowPreviewRequest,
  ): Promise<WorkflowPreviewResult> {
    const startTime = Date.now();

    // Step 1: Validate definition
    const validation = validateWorkflowDefinition(request.definition);
    if (!validation.valid) {
      return {
        success: false,
        mode: request.mode,
        validationErrors: validation.errors,
        nodeResults: [],
        output: null,
        durationMs: Date.now() - startTime,
        warnings: [],
      };
    }

    // Step 2: Execute based on mode
    switch (request.mode) {
      case 'validate':
        return this.validateOnly(request, startTime);
      case 'dry-run':
        return this.dryRun(request, startTime);
      case 'execute':
        return this.executeWorkflow(request, startTime);
      case 'step':
        return this.stepThrough(request, startTime);
      default:
        return {
          success: false,
          mode: request.mode,
          validationErrors: [`Unknown preview mode: ${request.mode}`],
          nodeResults: [],
          output: null,
          durationMs: Date.now() - startTime,
          warnings: [],
        };
    }
  }

  /**
   * Preview a single node.
   */
  async previewNode(
    definition: WorkflowDefinition,
    nodeId: string,
    input: unknown,
    options?: PreviewOptions,
  ): Promise<PreviewNodeResult> {
    // Find the node
    const node = definition.nodes.find(n => n.id === nodeId);
    if (!node) {
      return {
        nodeId,
        nodeType: 'unknown',
        nodeName: 'unknown',
        input,
        output: null,
        success: false,
        error: `Node not found: ${nodeId}`,
        durationMs: 0,
      };
    }

    // Execute single node
    const startTime = Date.now();
    try {
      const registry = this.workflowExecutor.getRegistry();
      const handler = registry.getHandler(node.type);
      if (!handler) {
        return {
          nodeId: node.id,
          nodeType: node.type,
          nodeName: node.name,
          input,
          output: null,
          success: false,
          error: `Unknown node type: ${node.type}`,
          durationMs: Date.now() - startTime,
        };
      }

      const nodeContext = {
        workflowId: 'preview',
        executionId: `preview-${Date.now()}`,
        nodeId: node.id,
        nodeResults: new Map(),
        startedAt: new Date(),
      };

      const result = await handler.execute(input, node.parameters, nodeContext);
      return {
        nodeId: node.id,
        nodeType: node.type,
        nodeName: node.name,
        input,
        output: result.output,
        success: true,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        nodeId: node.id,
        nodeType: node.type,
        nodeName: node.name,
        input,
        output: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };
    }
  }

  private validateOnly(
    request: WorkflowPreviewRequest,
    startTime: number,
  ): WorkflowPreviewResult {
    const validation = validateWorkflowDefinition(request.definition);
    return {
      success: validation.valid,
      mode: 'validate',
      validationErrors: validation.errors,
      nodeResults: [],
      output: null,
      durationMs: Date.now() - startTime,
      warnings: [],
    };
  }

  private async dryRun(
    request: WorkflowPreviewRequest,
    startTime: number,
  ): Promise<WorkflowPreviewResult> {
    // Dry-run: validate and report what would execute, without actually executing
    const warnings: string[] = [];
    const nodeResults: PreviewNodeResult[] = [];

    for (const node of request.definition.nodes) {
      nodeResults.push({
        nodeId: node.id,
        nodeType: node.type,
        nodeName: node.name,
        input: null,
        output: null,
        success: true,
        durationMs: 0,
      });

      // Check for potential issues
      if (node.type === 'http-request') {
        warnings.push(`Node "${node.id}" will make HTTP requests in production`);
      }
      if (node.type === 'delay') {
        warnings.push(`Node "${node.id}" will introduce delays in production`);
      }
    }

    return {
      success: true,
      mode: 'dry-run',
      validationErrors: [],
      nodeResults,
      output: null,
      durationMs: Date.now() - startTime,
      warnings,
    };
  }

  private async executeWorkflow(
    request: WorkflowPreviewRequest,
    startTime: number,
  ): Promise<WorkflowPreviewResult> {
    const executionId = `preview-${Date.now()}`;
    const result = await this.workflowExecutor.execute(
      'preview',
      executionId,
      request.definition,
      request.input ?? {},
    );

    const nodeResults: PreviewNodeResult[] = Object.entries(result.nodeResults).map(
      ([nodeId, output]) => {
        const node = request.definition.nodes.find(n => n.id === nodeId);
        return {
          nodeId,
          nodeType: node?.type ?? 'unknown',
          nodeName: node?.name ?? nodeId,
          input: null,
          output,
          success: true,
          durationMs: 0,
        };
      },
    );

    return {
      success: result.status === 'completed',
      mode: 'execute',
      validationErrors: result.error ? [result.error] : [],
      nodeResults,
      output: result.output,
      durationMs: Date.now() - startTime,
      warnings: [],
    };
  }

  private async stepThrough(
    request: WorkflowPreviewRequest,
    startTime: number,
  ): Promise<WorkflowPreviewResult> {
    // Step-through: execute and capture each node's result
    // For now, this is the same as execute but with detailed node results
    return this.executeWorkflow(request, startTime);
  }
}
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/preview/docs` | Redirect to Swagger UI |
| POST | `/api/v1/preview/workflow` | Preview a workflow definition |
| POST | `/api/v1/preview/workflow/validate` | Validate a workflow definition |
| POST | `/api/v1/preview/node` | Preview a single node |

### Swagger/OpenAPI Integration

Use `@nestjs/swagger` to generate OpenAPI documentation:

```typescript
// apps/api/src/main.ts (updated)
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ... existing setup ...

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('DevFlow Platform API')
    .setDescription('Developer workflow automation platform')
    .setVersion('0.1.0')
    .addTag('projects', 'Project management')
    .addTag('workflows', 'Workflow management')
    .addTag('triggers', 'Trigger management')
    .addTag('webhooks', 'Webhook execution')
    .addTag('credentials', 'Credential management')
    .addTag('oauth', 'OAuth integration')
    .addTag('preview', 'Workflow preview')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

### File Structure

#### packages/workflow-core (framework-independent)

```
packages/workflow-core/src/
├── preview-system/
│   ├── preview-types.ts              # PreviewMode, WorkflowPreviewRequest, etc.
│   ├── preview-executor.ts           # Preview execution logic
│   ├── preview-executor.spec.ts      # Tests
│   ├── node-mock-registry.ts         # Mock registry for preview (mocks HTTP, delays)
│   ├── node-mock-registry.spec.ts    # Tests
│   └── index.ts                      # Barrel export
├── index.ts                          # Updated exports
```

#### apps/api (NestJS)

```
apps/api/src/
├── modules/
│   └── preview/
│       ├── preview.module.ts
│       ├── preview.service.ts        # Preview orchestration
│       ├── preview.controller.ts     # API endpoints
│       ├── preview.service.spec.ts
│       ├── preview.controller.spec.ts
│       └── dto/
│           ├── workflow-preview.dto.ts
│           ├── node-preview.dto.ts
│           └── index.ts
├── main.ts                           # Updated with Swagger setup
```

## Dependencies

### New Dependencies

| Package | Version | Why |
|---------|---------|-----|
| `@nestjs/swagger` | `^7.0.0` | OpenAPI/Swagger integration for NestJS |

**Rationale**: `@nestjs/swagger` is the official NestJS Swagger module. It generates OpenAPI documentation from decorators and provides interactive Swagger UI. It's maintained by the NestJS team and is the standard approach.

### Updated Dependencies

None.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SWAGGER_ENABLED` | No | Enable Swagger UI (default: `true` in development) |
| `PREVIEW_TIMEOUT_MS` | No | Default preview timeout (default: `30000`) |

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Preview executes arbitrary workflows | Sandboxed — no database writes, no production credentials |
| HTTP requests in preview | Mocked by default, explicit opt-in for real requests |
| Resource exhaustion | Timeout limits, max node count |
| Swagger exposes API structure | Only enabled in development, configurable |
| Preview data leaks | Preview results are ephemeral, not stored permanently |

## Testing Strategy

### Unit Tests (workflow-core)

- **PreviewExecutor:**
  - Validates definition and returns errors
  - Executes workflow in preview mode
  - Handles unknown node types gracefully
  - Respects timeout limits
  - Returns node results for each step

- **NodeMockRegistry:**
  - Mocks HTTP requests with fake responses
  - Skips delays by default
  - Allows real HTTP when opted in

### Unit Tests (API)

- **PreviewService:**
  - Orchestrates preview execution
  - Handles validation-only mode
  - Returns proper error responses

- **PreviewController:**
  - POST /preview/workflow works
  - POST /preview/workflow/validate works
  - POST /preview/node works
  - Returns proper HTTP status codes

### Integration Tests

- Complete preview flow (send definition → get results)
- Validation-only preview
- Single node preview
- Error handling (invalid definition, unknown node type)

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

# Test Swagger UI
# Start the server and visit http://localhost:3000/api/docs
```

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Swagger dependency adds bundle size | Low | Low | @nestjs/swagger is lightweight |
| Preview execution is slow | Medium | Low | Timeout limits, node count limits |
| Mock responses are unrealistic | Medium | Low | Allow opt-in for real requests |
| Preview differs from production | Medium | Medium | Document preview limitations |
| Resource exhaustion via preview | Low | Medium | Rate limiting (future), timeouts |

## How Future Previews Are Added

Adding new preview types requires:

1. Create `packages/workflow-core/src/preview-system/{type}-preview.ts`
2. Implement preview logic
3. Register in `PreviewExecutor`
4. Add API endpoint in `PreviewController`
5. Add tests

**Example: Component Preview (future)**

```typescript
export interface ComponentPreviewRequest {
  componentDefinition: ComponentDefinition;
  config: Record<string, unknown>;
  mode: 'render' | 'test';
}

export interface ComponentPreviewResult {
  success: boolean;
  output: unknown;
  errors: string[];
}
```

## Completion Checklist

- [x] Plan approved by human
- [x] `@nestjs/swagger` installed
- [x] Swagger/OpenAPI configured in main.ts
- [x] PreviewTypes defined (framework-independent)
- [x] PreviewExecutor implemented
- [x] NodeMockRegistry implemented
- [x] PreviewModule created in API
- [x] PreviewService implemented
- [x] PreviewController implemented
- [x] DTOs created with Swagger decorators
- [x] API endpoints work
- [x] Swagger UI accessible at `/api/docs`
- [x] Unit tests pass
- [x] Integration tests pass
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Documentation updated
