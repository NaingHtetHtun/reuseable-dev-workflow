# 004 — Node System

## Status

**IMPLEMENTED** — Completed 2026-08-29.

## Goal

Implement a pluggable node type registry that the workflow executor uses to execute individual steps. The node system must be framework-independent so it can later be reused by the code-generation system.

## Problem

The current `WorkflowExecutor` has hardcoded node types (`log`, `set-variable`, `no-op`) in a switch statement. This is not extensible — adding a new node type requires modifying the executor. A proper node registry allows adding new capabilities without touching the workflow engine.

## Scope

### In Scope

1. **Node type interface** — Framework-independent contract for node types.
2. **Node type registry** — Register, lookup, and validate node types.
3. **Node type metadata** — Name, description, category, parameter schemas.
4. **Parameter schemas** — JSON Schema-like validation for node parameters.
5. **Input/output schemas** — Declare what nodes accept and produce.
6. **Node handler contract** — Execution interface for node implementations.
7. **Built-in node types** — Formalize existing nodes + add useful foundation nodes.
8. **Registry integration** — Refactor executor to use registry instead of switch.
9. **Node validation** — Validate node parameters against schema.
10. **Testing** — Unit tests for registry, validator, each built-in node.

### Non-Goals

- ❌ Google Login or OAuth providers — Phase 7
- ❌ Credentials storage — Phase 5
- ❌ Visual workflow builder — Phase 9
- ❌ Frontend UI
- ❌ Code generation — Phase 10-12
- ❌ Laravel/NestJS generators
- ❌ AI features — Phase 13
- ❌ Parallel execution
- ❌ Complex conditional execution
- ❌ Custom node creation UI
- ❌ Node marketplace

## Architecture

### Framework Independence

The node system is defined as plain TypeScript interfaces and classes with no NestJS decorators, no Prisma imports, and no HTTP dependencies. This allows:

- The workflow executor (NestJS module) to consume it.
- The code-generation system (future) to read node definitions.
- The visual builder (future) to display node metadata.

```
src/modules/workflows/engine/
├── node-system/
│   ├── node-type.interface.ts       # Framework-independent interfaces
│   ├── node-registry.ts             # Registry implementation
│   ├── node-validator.ts            # Parameter validation
│   ├── builtin/
│   │   ├── log.node.ts              # Log node
│   │   ├── set-variable.node.ts     # Set variable node
│   │   ├── no-op.node.ts            # No-op node
│   │   ├── http-request.node.ts     # HTTP request node
│   │   └── delay.node.ts            # Delay node
│   ├── node-registry.spec.ts
│   ├── node-validator.spec.ts
│   └── builtin/
│       ├── log.node.spec.ts
│       ├── set-variable.node.spec.ts
│       ├── http-request.node.spec.ts
│       └── delay.node.spec.ts
```

### Node Type Interface

```typescript
// --- Framework-independent interfaces (no NestJS, no Prisma) ---

/** Describes a node type's capabilities and requirements */
export interface NodeTypeDefinition {
  /** Unique type identifier (e.g., 'log', 'http-request') */
  type: string;

  /** Human-readable display name */
  displayName: string;

  /** Description of what this node does */
  description: string;

  /** Category for grouping (e.g., 'core', 'integration', 'logic') */
  category: string;

  /** Version of this node type definition */
  version: number;

  /** JSON Schema-like parameter validation */
  parameterSchema: ParameterSchema;

  /** What this node accepts as input */
  inputSchema: IoSchema;

  /** What this node produces as output */
  outputSchema: IoSchema;

  /** Credential types required by this node (Phase 5 placeholder) */
  requiredCredentials?: CredentialRequirement[];
}

/** JSON Schema-like parameter definition */
export interface ParameterSchema {
  type: 'object';
  properties: Record<string, ParameterDefinition>;
  required?: string[];
}

export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

/** Input/Output schema declaration */
export interface IoSchema {
  type: 'object';
  properties: Record<string, { type: string; description?: string }>;
}

/** Credential requirement (Phase 5 placeholder) */
export interface CredentialRequirement {
  type: string;
  name: string;
  required: boolean;
}

/** Execution context passed to node handlers */
export interface NodeExecutionContext {
  workflowId: string;
  executionId: string;
  nodeId: string;
  nodeResults: Map<string, unknown>;
  startedAt: Date;
}

/** Result of node execution */
export interface NodeExecutionResult {
  output: unknown;
}

/** The contract a node handler must implement */
export interface NodeHandler {
  /** The type this handler implements */
  readonly type: string;

  /** Execute the node with given input and parameters */
  execute(
    input: unknown,
    parameters: Record<string, unknown>,
    context: NodeExecutionContext,
  ): Promise<NodeExecutionResult>;

  /** Optional custom validation beyond schema */
  validate?(parameters: Record<string, unknown>): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

### Node Registry

```typescript
export class NodeRegistry {
  private definitions = new Map<string, NodeTypeDefinition>();
  private handlers = new Map<string, NodeHandler>();

  /** Register a node type with its definition and handler */
  register(definition: NodeTypeDefinition, handler: NodeHandler): void;

  /** Get a node type definition */
  getDefinition(type: string): NodeTypeDefinition | undefined;

  /** Get a node handler */
  getHandler(type: string): NodeHandler | undefined;

  /** Check if a node type is registered */
  hasType(type: string): boolean;

  /** Get all registered type definitions */
  getAllDefinitions(): NodeTypeDefinition[];

  /** Get definitions by category */
  getByCategory(category: string): NodeTypeDefinition[];

  /** Validate parameters against a node type's schema */
  validateParameters(type: string, parameters: Record<string, unknown>): ValidationResult;
}
```

### Node Validator

Validates a `WorkflowNode` against the registry:

1. Node type must be registered.
2. Required parameters must be present.
3. Parameter types must match schema.
4. Parameter values must satisfy constraints (enum, min/max, etc.).

### Built-in Node Types

#### 1. `log` (core)

Logs a message. Already exists, formalized.

**Parameters:**

- `message` (string, required): Message to log

**Input:** Any  
**Output:** `{ logged: true, message: string, input: unknown }`

#### 2. `set-variable` (core)

Sets a named variable in the execution context. Already exists, formalized.

**Parameters:**

- `name` (string, required): Variable name
- `value` (any, required): Variable value

**Input:** Any  
**Output:** `{ ...input, [name]: value }`

#### 3. `no-op` (core)

Passes input through unchanged. Already exists, formalized.

**Parameters:** None  
**Input:** Any  
**Output:** Same as input

#### 4. `http-request` (integration)

Makes an HTTP request. Genuinely useful for testing integrations.

**Parameters:**

- `url` (string, required): Request URL
- `method` (string, optional, default: 'GET'): HTTP method
- `headers` (object, optional): Request headers
- `body` (any, optional): Request body

**Input:** Merged with parameters  
**Output:** `{ status: number, headers: object, body: any }`

#### 5. `delay` (core)

Waits for a specified duration. Useful for testing async workflows.

**Parameters:**

- `duration` (number, required): Milliseconds to wait

**Input:** Any  
**Output:** Same as input (after delay)

### Executor Refactor

The `WorkflowExecutor` will be refactored to:

1. Accept a `NodeRegistry` instance.
2. Look up handlers from the registry instead of using a switch statement.
3. Pass `NodeExecutionContext` to handlers.
4. Use `NodeExecutionResult` from handlers.

**Before:**

```typescript
private executeNode(node: WorkflowNode, input: unknown): unknown {
  switch (node.type) {
    case 'log': return this.executeLogNode(node, input);
    case 'set-variable': return this.executeSetVariableNode(node, input);
    case 'no-op': return input;
    default: throw new Error(`Unknown node type: ${node.type}`);
  }
}
```

**After:**

```typescript
private async executeNode(
  node: WorkflowNode,
  input: unknown,
  context: NodeExecutionContext,
): Promise<unknown> {
  const handler = this.registry.getHandler(node.type);
  if (!handler) {
    throw new Error(`Unknown node type: ${node.type}`);
  }
  const result = await handler.execute(input, node.parameters, context);
  return result.output;
}
```

### How Future Nodes Are Added

1. Create a new file in `builtin/` or a new module.
2. Define the `NodeTypeDefinition` (metadata + schemas).
3. Implement the `NodeHandler` interface.
4. Register with the `NodeRegistry`.

**Example: Future `google-login` node (Phase 7)**

```typescript
const googleLoginDefinition: NodeTypeDefinition = {
  type: 'google-login',
  displayName: 'Google Login',
  description: 'Authenticate with Google OAuth2',
  category: 'integration',
  version: 1,
  parameterSchema: { ... },
  inputSchema: { ... },
  outputSchema: { ... },
  requiredCredentials: [{ type: 'google-oauth2', name: 'Google OAuth2', required: true }],
};

class GoogleLoginHandler implements NodeHandler {
  readonly type = 'google-login';
  async execute(input, parameters, context) { ... }
}

registry.register(googleLoginDefinition, new GoogleLoginHandler());
```

### Credential Integration (Phase 5 Placeholder)

The `NodeExecutionContext` will later include a credential resolver:

```typescript
interface NodeExecutionContext {
  // ... existing fields
  /** Resolve a credential by ID (Phase 5) */
  // resolveCredential?(id: string): Promise<CredentialValue>;
}
```

Nodes that need credentials will declare them in `requiredCredentials` and use the resolver during execution.

### Workflow JSON Definition

Nodes are represented in the workflow definition as before:

```json
{
  "id": "node-1",
  "type": "http-request",
  "name": "Fetch Data",
  "parameters": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "headers": { "Accept": "application/json" }
  }
}
```

The `type` field maps to the registry. The `parameters` field is validated against the node type's `parameterSchema`.

## API

No new API endpoints. The node system is internal to the workflow engine.

## Dependencies

### New Dependencies

None. The node system is pure TypeScript — no external packages needed.

## Testing Strategy

### Unit Tests

- **NodeRegistry**:
  - Registers and retrieves node types
  - Rejects duplicate type registration
  - Returns undefined for unknown types
  - Filters by category
  - Validates parameters against schema

- **NodeValidator**:
  - Accepts valid parameters
  - Rejects missing required parameters
  - Rejects wrong parameter types
  - Rejects values outside constraints

- **Built-in nodes**:
  - `log`: Logs message, returns correct output
  - `set-variable`: Sets variable, merges with input
  - `no-op`: Passes input through unchanged
  - `http-request`: Makes request (mock fetch), returns response
  - `delay`: Waits for duration (mock timers), passes input

- **WorkflowExecutor** (updated):
  - Executes workflow using registry
  - Handles unknown node types via registry
  - Passes correct context to handlers

## Preview

After implementation, verify with:

```bash
# 1. Run all checks
pnpm test && pnpm typecheck && pnpm lint

# 2. Start the application
pnpm start:dev

# 3. Create and execute a workflow with multiple node types
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Multi-Node Test",
    "definition": {
      "nodes": [
        {"id": "n1", "type": "set-variable", "name": "Set", "parameters": {"name": "greeting", "value": "Hello"}},
        {"id": "n2", "type": "log", "name": "Log", "parameters": {"message": "Processing"}},
        {"id": "n3", "type": "no-op", "name": "Pass", "parameters": {}}
      ],
      "edges": [
        {"id": "e1", "source": "n1", "target": "n2"},
        {"id": "e2", "source": "n2", "target": "n3"}
      ]
    }
  }'

# 4. Execute it
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"initial": true}}'
```

## Documentation

After implementation, update:

- `docs/architecture/overview.md` — Add node system description
- `docs/state/PROJECT-STATE.md` — Update completed items
- `docs/state/CHANGELOG.md` — Add completion entry

## Risks

| Risk                                     | Likelihood | Impact | Mitigation                              |
| ---------------------------------------- | ---------- | ------ | --------------------------------------- |
| Executor refactor breaks existing tests  | Medium     | Medium | Run tests after each refactor step      |
| HTTP request node needs fetch (Node 18+) | Low        | Low    | Node 20+ has native fetch               |
| Schema validation too complex            | Low        | Low    | Keep schemas simple, JSON Schema subset |

## Known Limitations

- No parallel execution.
- No conditional branching.
- No webhook/scheduled triggers.
- No credential integration (Phase 5).
- No visual builder (Phase 9).
- No code generation support (Phase 10).

## Files Changed

| File                                                                         | Action                                |
| ---------------------------------------------------------------------------- | ------------------------------------- |
| `src/modules/workflows/engine/node-system/node-type.interface.ts`            | Created                               |
| `src/modules/workflows/engine/node-system/node-registry.ts`                  | Created                               |
| `src/modules/workflows/engine/node-system/node-validator.ts`                 | Created                               |
| `src/modules/workflows/engine/node-system/index.ts`                          | Created                               |
| `src/modules/workflows/engine/node-system/builtin/log.node.ts`               | Created                               |
| `src/modules/workflows/engine/node-system/builtin/set-variable.node.ts`      | Created                               |
| `src/modules/workflows/engine/node-system/builtin/no-op.node.ts`             | Created                               |
| `src/modules/workflows/engine/node-system/builtin/http-request.node.ts`      | Created                               |
| `src/modules/workflows/engine/node-system/builtin/delay.node.ts`             | Created                               |
| `src/modules/workflows/engine/node-system/builtin/index.ts`                  | Created                               |
| `src/modules/workflows/engine/node-system/node-registry.spec.ts`             | Created                               |
| `src/modules/workflows/engine/node-system/node-validator.spec.ts`            | Created                               |
| `src/modules/workflows/engine/node-system/builtin/log.node.spec.ts`          | Created                               |
| `src/modules/workflows/engine/node-system/builtin/set-variable.node.spec.ts` | Created                               |
| `src/modules/workflows/engine/node-system/builtin/no-op.node.spec.ts`        | Created                               |
| `src/modules/workflows/engine/node-system/builtin/http-request.node.spec.ts` | Created                               |
| `src/modules/workflows/engine/node-system/builtin/delay.node.spec.ts`        | Created                               |
| `src/modules/workflows/engine/workflow-executor.ts`                          | Modified (refactored to use registry) |
| `src/modules/workflows/workflows.service.ts`                                 | Modified (async executor call)        |
| `src/modules/workflows/engine/workflow-executor.spec.ts`                     | Modified (async tests)                |

## Completion Checklist

- [x] Plan approved by human
- [x] Node type interfaces defined (framework-independent)
- [x] NodeRegistry implemented
- [x] NodeValidator implemented
- [x] Built-in nodes: log, set-variable, no-op, http-request, delay
- [x] Executor refactored to use registry
- [x] Existing tests updated and passing
- [x] New tests written and passing (31 new tests)
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Feature documentation updated
