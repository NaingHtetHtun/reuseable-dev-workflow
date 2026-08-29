# 003 — Workflow Engine (Revised)

## Status

**IMPLEMENTED** — Completed 2026-08-29.

## Goal

Implement workflow definition, management, and basic execution — the core product abstraction. Workflows are directed graphs of nodes that can be defined, validated, stored, and executed.

## Problem

The platform has no concept of "workflows" yet. The core product value is visual workflow automation, and workflows are the primary abstraction developers will configure and execute.

## Research Summary

### Patterns Evaluated

| System | Model | Format | Key Insight |
|--------|-------|--------|-------------|
| **AWS Step Functions** | State machine | JSON (ASL) | States with types, `Next`/`End` transitions, data passes between states as JSON |
| **n8n** | Node graph | JSON | Nodes with types + parameters, connections define data flow, visual position stored |
| **Temporal** | Code-based | TypeScript/Go | Workflows are code, not JSON. Activities are units of work. Signals/Queries for interaction. |
| **Camunda** | BPMN | XML | Tasks, gateways, events, sequence flows. Formal standard but complex. |

### Design Decision: Node-Edge Graph (n8n-style)

**Why not state machine (AWS ASL)?**
- State machines are powerful but add complexity (Choice, Parallel, Map states).
- For Phase 3, sequential execution is sufficient.
- State machine semantics can be added later as node types.

**Why not code-based (Temporal)?**
- Temporal workflows are code, not data. Our platform needs definitions as data for visual builder and code generation.
- Code-based workflows can't be visually edited or exported to frameworks.

**Why not BPMN (Camunda)?**
- BPMN is XML-based, verbose, and complex.
- Overkill for our use case. JSON is simpler and more developer-friendly.

**Selected: Node-Edge Graph**
- Simple, intuitive, JSON-based.
- Compatible with visual builder (nodes have positions).
- Compatible with code generation (definitions are data).
- Extensible via node types (Phase 4 adds built-in nodes).
- Framework-independent (no NestJS or Laravel assumptions in the definition).

## Scope

### In Scope

1. **Workflow data model** — Prisma schema with `Workflow` and `WorkflowExecution` models.
2. **Workflow definition format** — JSON-based directed graph (nodes + edges).
3. **Workflow CRUD API** — Create, read, update, delete, list with pagination.
4. **Workflow validation** — Check definition integrity.
5. **Workflow status management** — DRAFT → ACTIVE → ARCHIVED lifecycle.
6. **Basic execution engine** — Sequential node execution with context passing.
7. **Execution history** — Record each workflow execution with status and output.
8. **Error handling** — Catch and record errors during execution.

### Non-Goals

- ❌ Visual workflow builder (UI) — Phase 9
- ❌ Parallel execution — future enhancement
- ❌ Conditional branching — future enhancement (add `condition` field to edges)
- ❌ Webhook triggers — future enhancement (add trigger model)
- ❌ Scheduled execution — future enhancement
- ❌ Node system (built-in nodes) — Phase 4
- ❌ Authentication — Phase 14
- ❌ Real external integrations — Phase 5

## Architecture

### Workflow Definition Format

Based on research of n8n, AWS ASL, and common workflow patterns:

```typescript
// Top-level workflow definition
interface WorkflowDefinition {
  /** Nodes in the workflow graph */
  nodes: WorkflowNode[];
  
  /** Edges connecting nodes (directed) */
  edges: WorkflowEdge[];
  
  /** Optional metadata for visual builder */
  viewport?: { x: number; y: number; zoom: number };
}

// A node represents a step in the workflow
interface WorkflowNode {
  /** Unique identifier within the workflow */
  id: string;
  
  /** Node type identifier (e.g., 'log', 'http-request', 'set-variable') */
  type: string;
  
  /** Human-readable name for display */
  name: string;
  
  /** Type-specific configuration */
  parameters: Record<string, unknown>;
  
  /** Position in visual builder (optional) */
  position?: { x: number; y: number };
  
  /** Credentials required by this node (reference IDs) */
  credentialIds?: string[];
}

// An edge represents a connection between nodes
interface WorkflowEdge {
  /** Unique identifier for this edge */
  id: string;
  
  /** Source node ID */
  source: string;
  
  /** Target node ID */
  target: string;
  
  /** Source output index (for nodes with multiple outputs, default: 0) */
  sourceOutput?: number;
  
  /** Optional condition for conditional edges (future) */
  condition?: Record<string, unknown>;
}
```

**Design rationale:**
- `id` on edges allows future reference (e.g., for visual builder selection).
- `sourceOutput` supports future multi-output nodes (e.g., Choice/If nodes).
- `condition` on edges is a placeholder for future conditional branching.
- `credentialIds` references credentials by ID (Phase 5), keeping definitions clean.
- `position` supports visual builder (Phase 9) without requiring it now.
- `parameters` is a generic Record — node types define their own schema.

### Data Model

```prisma
model Workflow {
  id          String   @id @default(uuid())
  projectId   String   @map("project_id")
  name        String
  description String?
  status      String   @default("draft")  // draft, active, archived
  version     Int      @default(1)
  definition  Json
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  project    Project           @relation(fields: [projectId], references: [id])
  executions WorkflowExecution[]

  @@index([projectId])
  @@map("workflows")
}

model WorkflowExecution {
  id          String    @id @default(uuid())
  workflowId  String    @map("workflow_id")
  status      String    @default("running")  // running, completed, failed
  input       Json?
  output      Json?
  error       String?
  nodeResults Json?     // Per-node execution results
  startedAt   DateTime  @default(now()) @map("started_at")
  completedAt DateTime? @map("completed_at")

  workflow Workflow @relation(fields: [workflowId], references: [id])

  @@index([workflowId])
  @@map("workflow_executions")
}
```

**Key decisions:**
- `definition` is `Json` — framework-independent, stored as-is.
- `version` is an integer — incremented on each update (simple, explicit).
- `status` is a string enum — DRAFT → ACTIVE → ARCHIVED.
- `nodeResults` stores per-node output for debugging/history.
- `workflowId` has an index for efficient execution lookups.

### Versioning Strategy

Simple integer versioning:
- Version starts at 1 on creation.
- Incremented on each `update` call.
- No draft/published version separation (too complex for Phase 3).
- Future: Could add version history table if needed.

### Execution Context

During execution, a context object flows through nodes:

```typescript
interface ExecutionContext {
  /** The workflow being executed */
  workflowId: string;
  
  /** The execution ID */
  executionId: string;
  
  /** Initial input to the workflow */
  input: unknown;
  
  /** Results from previously executed nodes */
  nodeResults: Map<string, unknown>;
  
  /** Current node being executed */
  currentNodeId: string;
  
  /** Timestamp of execution start */
  startedAt: Date;
}
```

**Data flow between nodes:**
1. Workflow receives `input` (JSON).
2. First node receives `input` as its input.
3. Each node produces `output`.
4. Next node receives previous node's `output` as its input.
5. Final node's `output` becomes the workflow execution's `output`.

This is the same pattern used by n8n and AWS Step Functions.

### Validation Rules

1. **At least one node** — Workflow must have nodes.
2. **Unique node IDs** — No duplicate node IDs.
3. **Unique edge IDs** — No duplicate edge IDs.
4. **Valid edge references** — All `source`/`target` must reference existing nodes.
5. **No self-loops** — Edge cannot connect a node to itself.
6. **Acyclic graph** — No circular references (DFS-based cycle detection).
7. **Single start node** — Exactly one node with no incoming edges (the entry point).
8. **Node type exists** — Node type must be registered (Phase 4 will register built-in types; Phase 3 allows any type).

### Execution Engine

Basic sequential executor for Phase 3:

1. Load workflow definition.
2. Validate definition.
3. Find start node (node with no incoming edges).
4. Topologically sort nodes.
5. Execute nodes sequentially.
6. Pass output from one node as input to the next.
7. Record execution status and result.

**Node execution:**
- For Phase 3, only `log` type is implemented (prints to console).
- Phase 4 adds built-in node types (HTTP, delay, set-variable, etc.).
- Unknown node types throw an error during execution.

**Error handling:**
- If a node throws, execution stops.
- Execution status set to `failed`.
- Error message recorded in `error` field.
- Partial results stored in `nodeResults`.

### Directory Structure

```
src/modules/workflows/
├── workflows.module.ts
├── workflows.controller.ts
├── workflows.service.ts
├── dto/
│   ├── create-workflow.dto.ts
│   ├── update-workflow.dto.ts
│   ├── workflow-response.dto.ts
│   └── workflow-query.dto.ts
├── engine/
│   ├── workflow-executor.ts        # Execution engine
│   ├── workflow-validator.ts       # Definition validation
│   └── types.ts                    # Workflow definition types
├── workflows.service.spec.ts
├── workflows.controller.spec.ts
└── engine/
    ├── workflow-executor.spec.ts
    └── workflow-validator.spec.ts
```

## API

### Endpoints

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/api/v1/projects/:projectId/workflows` | Create workflow | 201 |
| GET | `/api/v1/projects/:projectId/workflows` | List workflows | 200 |
| GET | `/api/v1/projects/:projectId/workflows/:id` | Get workflow | 200 |
| PATCH | `/api/v1/projects/:projectId/workflows/:id` | Update workflow | 200 |
| DELETE | `/api/v1/projects/:projectId/workflows/:id` | Delete workflow | 204 |
| POST | `/api/v1/projects/:projectId/workflows/:id/execute` | Execute workflow | 201 |
| GET | `/api/v1/projects/:projectId/workflows/:id/executions` | List executions | 200 |

### Request/Response Formats

#### POST /api/v1/projects/:projectId/workflows

Request:
```json
{
  "name": "My Workflow",
  "description": "Optional description",
  "definition": {
    "nodes": [
      {
        "id": "node-1",
        "type": "log",
        "name": "Log Hello",
        "parameters": { "message": "Hello, World!" }
      }
    ],
    "edges": []
  }
}
```

Response 201:
```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "name": "My Workflow",
  "description": "Optional description",
  "status": "draft",
  "version": 1,
  "definition": {
    "nodes": [
      {
        "id": "node-1",
        "type": "log",
        "name": "Log Hello",
        "parameters": { "message": "Hello, World!" }
      }
    ],
    "edges": []
  },
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### POST /api/v1/projects/:projectId/workflows/:id/execute

Request:
```json
{
  "input": { "key": "value" }
}
```

Response 201:
```json
{
  "id": "execution-uuid",
  "workflowId": "workflow-uuid",
  "status": "completed",
  "input": { "key": "value" },
  "output": null,
  "error": null,
  "nodeResults": {
    "node-1": { "logged": true }
  },
  "startedAt": "...",
  "completedAt": "..."
}
```

#### GET /api/v1/projects/:projectId/workflows/:id/executions

Response 200:
```json
{
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

## Dependencies

### New Dependencies

None. All required packages are already installed.

## Testing Strategy

### Unit Tests

- **WorkflowValidator**:
  - Rejects empty node list
  - Rejects duplicate node IDs
  - Rejects duplicate edge IDs
  - Rejects edges referencing non-existent nodes
  - Rejects self-loops
  - Rejects cyclic graphs
  - Rejects multiple start nodes
  - Accepts valid linear workflow
  - Accepts valid branching workflow

- **WorkflowExecutor**:
  - Executes single-node workflow
  - Executes multi-node sequential workflow
  - Passes output between nodes
  - Records node results
  - Handles execution errors
  - Rejects unknown node types

- **WorkflowsService**:
  - Creates workflow with valid definition
  - Rejects workflow with invalid definition
  - Returns paginated workflows
  - Returns single workflow by ID
  - Updates workflow and increments version
  - Deletes workflow
  - Triggers execution
  - Returns execution history

### Integration Tests

- **WorkflowsController**:
  - POST creates workflow (201)
  - POST rejects invalid definition (400)
  - GET returns paginated list (200)
  - GET returns workflow by ID (200)
  - GET returns 404 for missing workflow
  - PATCH updates workflow (200)
  - DELETE removes workflow (204)
  - POST execute runs workflow (201)
  - GET executions returns history (200)

## Preview

After implementation, verify with:

```bash
# 1. Start the application
pnpm start:dev

# 2. Create a workflow
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "definition": {
      "nodes": [
        {"id": "n1", "type": "log", "name": "Log", "parameters": {"message": "Hello"}}
      ],
      "edges": []
    }
  }'

# 3. Execute it
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {}}'

# 4. Check execution history
curl http://localhost:3000/api/v1/projects/{projectId}/workflows/{id}/executions

# 5. Run all checks
pnpm test && pnpm typecheck && pnpm lint
```

## Documentation

After implementation, update:
- `docs/architecture/overview.md` — Add workflows module
- `docs/state/PROJECT-STATE.md` — Update completed items
- `docs/state/CHANGELOG.md` — Add completion entry

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| JSON definition bloat | Low | Low | Future: paginate or compress |
| Execution engine scope creep | Medium | Medium | Keep minimal — sequential only |
| Node type registration complexity | Low | Low | Phase 3 allows any type; Phase 4 registers built-in types |

## Known Limitations

- No parallel execution.
- No conditional branching (edge `condition` field is placeholder).
- No webhook/scheduled triggers.
- No built-in node types beyond `log` (Phase 4).
- No visual builder (Phase 9).
- No credential integration (Phase 5).

## Future Extensibility

| Feature | How Definition Supports It |
|---------|---------------------------|
| **Built-in nodes (Phase 4)** | New `type` values registered in node registry |
| **Credentials (Phase 5)** | `credentialIds` field on nodes references credential IDs |
| **Triggers (future)** | Add `triggers` array to definition (webhook, schedule) |
| **Conditional edges (future)** | `condition` field on edges evaluated at runtime |
| **Visual builder (Phase 9)** | `position` field on nodes stores canvas coordinates |
| **Code generation (Phase 10-12)** | Definition is data — generators read nodes/edges/types |
| **Multi-output nodes (future)** | `sourceOutput` field on edges selects which output |

## Files Changed

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Modified (added Workflow, WorkflowExecution) |
| `src/modules/workflows/workflows.module.ts` | Created |
| `src/modules/workflows/workflows.controller.ts` | Created |
| `src/modules/workflows/workflows.service.ts` | Created |
| `src/modules/workflows/engine/types.ts` | Created |
| `src/modules/workflows/engine/workflow-validator.ts` | Created |
| `src/modules/workflows/engine/workflow-executor.ts` | Created |
| `src/modules/workflows/dto/create-workflow.dto.ts` | Created |
| `src/modules/workflows/dto/update-workflow.dto.ts` | Created |
| `src/modules/workflows/dto/execute-workflow.dto.ts` | Created |
| `src/modules/workflows/dto/workflow-response.dto.ts` | Created |
| `src/modules/workflows/dto/workflow-query.dto.ts` | Created |
| `src/modules/workflows/dto/execution-response.dto.ts` | Created |
| `src/modules/workflows/dto/index.ts` | Created |
| `src/modules/workflows/engine/workflow-validator.spec.ts` | Created |
| `src/modules/workflows/engine/workflow-executor.spec.ts` | Created |
| `src/modules/workflows/workflows.service.spec.ts` | Created |
| `src/modules/workflows/workflows.controller.spec.ts` | Created |
| `src/app.module.ts` | Modified (added WorkflowsModule) |
| `src/modules/projects/projects.module.ts` | Modified (exported ProjectsService) |

## Completion Checklist

- [x] Plan approved by human
- [x] Prisma schema updated with Workflow and WorkflowExecution
- [x] Prisma client regenerated
- [x] WorkflowsModule created and registered
- [x] WorkflowValidator implements all validation rules
- [x] WorkflowExecutor implements basic sequential execution
- [x] WorkflowsService implements CRUD + execution
- [x] WorkflowsController exposes all endpoints
- [x] DTOs validate input correctly
- [x] Workflows are scoped to projects
- [x] Execution history is recorded
- [x] Unit tests written and passing (44 tests)
- [x] Integration tests written and passing (21 tests)
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Feature documentation updated
- [x] Preview provided for human review
