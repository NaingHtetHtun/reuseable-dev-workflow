# 008 — Workflow Triggers

## Status

**IMPLEMENTED** — All verification criteria met.

## Goal

Establish a reusable, framework-independent trigger system that defines how and when workflows start executing. The architecture must support manual, webhook, scheduled, and event-based triggers.

## Problem

Currently, workflows can only be executed manually via `POST /api/v1/projects/:projectId/workflows/:id/execute`. This limits the platform to developer-initiated actions. Real-world workflows need to respond to external events, schedules, and API calls automatically.

## Scope

### In Scope

1. **Trigger abstraction** — Framework-independent interface for workflow triggers
2. **Trigger type registry** — Register and lookup trigger types
3. **Trigger metadata** — Display name, description, category, capabilities
4. **Trigger configuration schema** — JSON Schema-like validation for trigger config
5. **Trigger validation** — Validate trigger configuration against schema
6. **Trigger lifecycle** — Enable/disable, activate/deactivate
7. **Manual trigger** — Foundation trigger type (always available)
8. **Webhook trigger** — HTTP endpoint that triggers workflow execution
9. **Scheduled trigger** — Cron/time-based trigger definition (architecture only)
10. **Trigger → Workflow integration** — How triggers start workflow execution
11. **Execution context** — Trigger metadata in execution context
12. **Trigger payload mapping** — How trigger data becomes workflow input
13. **Authentication/security** — Webhook secret validation, HMAC signatures
14. **Idempotency** — Prevent duplicate executions from trigger
15. **Error handling** — Trigger failure isolation
16. **Trigger state** — Enable/disable, active/inactive
17. **Testing** — Unit tests for trigger logic, integration tests for API
18. **API endpoints** — Trigger management and webhook execution

### Non-Goals

- ❌ Visual workflow builder
- ❌ Background worker/queue system (cron scheduler infrastructure)
- ❌ Production webhook deployment (load balancing, high availability)
- ❌ Full cron scheduler (uses external scheduler or future worker)
- ❌ Event bus/message queue integration
- ❌ Google Login UI/session system
- ❌ Laravel/NestJS code generators
- ❌ AI features
- ❌ Trigger analytics/logging dashboard

## Architecture

### Design Principles

1. **Framework-independent** — Trigger definitions live in `packages/workflow-core`
2. **Registry-based** — New trigger types added without modifying core
3. **Configuration-driven** — Trigger behavior defined by JSON configuration
4. **Security-first** — Webhook secrets, HMAC validation, idempotency
5. **Composable** — Triggers can be combined (future: multiple triggers per workflow)

### Trigger Definition in Workflow

Triggers are defined as part of the workflow definition, not as separate entities:

```typescript
// packages/workflow-core/src/types.ts (updated)

export interface WorkflowDefinition {
  /** Trigger configuration (how this workflow starts) */
  trigger?: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface WorkflowTrigger {
  /** Trigger type identifier (e.g., 'manual', 'webhook', 'scheduled') */
  type: string;
  /** Trigger-specific configuration */
  config: Record<string, unknown>;
  /** Whether this trigger is enabled */
  enabled: boolean;
}
```

**Why triggers are part of the definition:**

- Triggers are metadata about how a workflow starts
- They are versioned with the workflow
- They are validated when the workflow is saved
- The code generator can read trigger definitions to generate framework-specific code

### Trigger Type Interface

```typescript
// packages/workflow-core/src/trigger-system/trigger-type.interface.ts

/** Describes a trigger type's capabilities and requirements */
export interface TriggerTypeDefinition {
  /** Unique type identifier (e.g., 'manual', 'webhook', 'scheduled') */
  type: string;
  /** Human-readable display name */
  displayName: string;
  /** Description of what this trigger does */
  description: string;
  /** Category for grouping (e.g., 'manual', 'http', 'schedule', 'event') */
  category: string;
  /** Version of this trigger type definition */
  version: number;
  /** JSON Schema-like configuration validation */
  configSchema: TriggerConfigSchema;
  /** What data this trigger produces as input */
  outputSchema: IoSchema;
  /** Whether this trigger requires authentication/credentials */
  requiresAuth: boolean;
  /** Whether this trigger creates a persistent endpoint (e.g., webhook URL) */
  hasEndpoint: boolean;
  /** Supported workflow statuses for this trigger */
  supportedStatuses: string[];
}

/** JSON Schema-like configuration definition */
export interface TriggerConfigSchema {
  type: 'object';
  properties: Record<string, TriggerConfigProperty>;
  required?: string[];
}

export interface TriggerConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  default?: unknown;
  enum?: unknown[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

/** Input/Output schema declaration */
export interface IoSchema {
  type: 'object';
  properties: Record<string, { type: string; description?: string }>;
}

/** The contract a trigger handler must implement */
export interface TriggerHandler {
  /** The type this handler implements */
  readonly type: string;

  /**
   * Validate trigger configuration.
   */
  validateConfig(config: Record<string, unknown>): ValidationResult;

  /**
   * Prepare trigger for activation.
   * Returns endpoint info if applicable (e.g., webhook URL).
   */
  activate(workflowId: string, config: Record<string, unknown>): Promise<TriggerActivationResult>;

  /**
   * Deactivate trigger.
   * Cleans up resources (e.g., removes webhook endpoint).
   */
  deactivate(workflowId: string): Promise<void>;

  /**
   * Check if trigger is currently active.
   */
  isActive(workflowId: string): Promise<boolean>;

  /**
   * Get trigger endpoint info (e.g., webhook URL).
   */
  getEndpointInfo?(workflowId: string): Promise<TriggerEndpointInfo | null>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface TriggerActivationResult {
  /** Whether activation was successful */
  success: boolean;
  /** Endpoint info if applicable */
  endpoint?: TriggerEndpointInfo;
  /** Error message if activation failed */
  error?: string;
}

export interface TriggerEndpointInfo {
  /** The URL or identifier for this trigger's endpoint */
  url: string;
  /** HTTP method (for webhooks) */
  method?: string;
  /** Required headers */
  headers?: Record<string, string>;
  /** Secret for validation (if applicable) */
  secret?: string;
}

/** Context provided when a trigger fires */
export interface TriggerContext {
  /** Workflow ID */
  workflowId: string;
  /** Trigger type */
  triggerType: string;
  /** Trigger-specific configuration */
  triggerConfig: Record<string, unknown>;
  /** Payload from the trigger (e.g., webhook body) */
  payload: unknown;
  /** Timestamp when trigger fired */
  firedAt: Date;
  /** Unique trigger event ID (for idempotency) */
  eventId: string;
  /** Trigger endpoint info */
  endpoint?: TriggerEndpointInfo;
}
```

### Trigger Type Registry

```typescript
// packages/workflow-core/src/trigger-system/trigger-type-registry.ts

export class TriggerTypeRegistry {
  private types = new Map<string, TriggerTypeDefinition>();
  private handlers = new Map<string, TriggerHandler>();

  register(definition: TriggerTypeDefinition, handler: TriggerHandler): void;
  get(type: string): { definition: TriggerTypeDefinition; handler: TriggerHandler } | undefined;
  hasType(type: string): boolean;
  getAll(): Array<{ definition: TriggerTypeDefinition; handler: TriggerHandler }>;
  getDefinitions(): TriggerTypeDefinition[];
  getByCategory(category: string): TriggerTypeDefinition[];
}
```

### Manual Trigger

The manual trigger is always available and requires no configuration:

```typescript
// packages/workflow-core/src/trigger-system/triggers/manual.trigger.ts

export const manualTriggerDefinition: TriggerTypeDefinition = {
  type: 'manual',
  displayName: 'Manual Trigger',
  description: 'Execute workflow manually via API call',
  category: 'manual',
  version: 1,
  configSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {
      input: { type: 'object', description: 'Input provided at execution time' },
    },
  },
  requiresAuth: false,
  hasEndpoint: false,
  supportedStatuses: ['active', 'draft'],
};

export class ManualTriggerHandler implements TriggerHandler {
  readonly type = 'manual';

  validateConfig(): ValidationResult {
    return { valid: true, errors: [] };
  }

  async activate(): Promise<TriggerActivationResult> {
    return { success: true };
  }

  async deactivate(): Promise<void> {
    // No-op for manual trigger
  }

  async isActive(): Promise<boolean> {
    return true; // Manual trigger is always active
  }
}
```

### Webhook Trigger

The webhook trigger creates an HTTP endpoint that executes the workflow:

```typescript
// packages/workflow-core/src/trigger-system/triggers/webhook.trigger.ts

export const webhookTriggerDefinition: TriggerTypeDefinition = {
  type: 'webhook',
  displayName: 'Webhook Trigger',
  description: 'Execute workflow when HTTP request is received',
  category: 'http',
  version: 1,
  configSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        description: 'HTTP method to accept',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        default: 'POST',
      },
      path: {
        type: 'string',
        description: 'Custom path suffix (auto-generated if empty)',
      },
      authentication: {
        type: 'string',
        description: 'Authentication method',
        enum: ['none', 'secret', 'hmac'],
        default: 'secret',
      },
      secret: {
        type: 'string',
        description: 'Webhook secret for validation',
      },
    },
    required: [],
  },
  outputSchema: {
    type: 'object',
    properties: {
      method: { type: 'string', description: 'HTTP method' },
      headers: { type: 'object', description: 'HTTP headers' },
      query: { type: 'object', description: 'Query parameters' },
      body: { type: 'object', description: 'Request body' },
      path: { type: 'string', description: 'Request path' },
    },
  },
  requiresAuth: false,
  hasEndpoint: true,
  supportedStatuses: ['active'],
};

export class WebhookTriggerHandler implements TriggerHandler {
  readonly type = 'webhook';

  validateConfig(config: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    // Validate authentication method
    // Validate secret if authentication is 'secret' or 'hmac'
    return { valid: errors.length === 0, errors };
  }

  async activate(
    workflowId: string,
    config: Record<string, unknown>,
  ): Promise<TriggerActivationResult> {
    // Generate webhook URL
    // Store webhook configuration
    // Return endpoint info
  }

  async deactivate(workflowId: string): Promise<void> {
    // Remove webhook configuration
  }

  async isActive(workflowId: string): Promise<boolean> {
    // Check if webhook is registered
  }

  async getEndpointInfo(workflowId: string): Promise<TriggerEndpointInfo | null> {
    // Return webhook URL and auth info
  }

  /**
   * Validate incoming webhook request.
   * Returns true if request is authentic.
   */
  validateRequest(headers: Record<string, string>, body: unknown, secret: string): boolean {
    // HMAC-SHA256 validation
  }
}
```

### Scheduled Trigger

The scheduled trigger defines a cron schedule (execution handled by external scheduler):

```typescript
// packages/workflow-core/src/trigger-system/triggers/scheduled.trigger.ts

export const scheduledTriggerDefinition: TriggerTypeDefinition = {
  type: 'scheduled',
  displayName: 'Scheduled Trigger',
  description: 'Execute workflow on a cron schedule',
  category: 'schedule',
  version: 1,
  configSchema: {
    type: 'object',
    properties: {
      cron: {
        type: 'string',
        description: 'Cron expression (e.g., "0 9 * * 1-5")',
      },
      timezone: {
        type: 'string',
        description: 'Timezone for cron expression',
        default: 'UTC',
      },
    },
    required: ['cron'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      scheduledTime: { type: 'string', description: 'Scheduled execution time' },
      triggeredAt: { type: 'string', description: 'Actual trigger time' },
    },
  },
  requiresAuth: false,
  hasEndpoint: false,
  supportedStatuses: ['active'],
};

export class ScheduledTriggerHandler implements TriggerHandler {
  readonly type = 'scheduled';

  validateConfig(config: Record<string, unknown>): ValidationResult {
    // Validate cron expression format
    const errors: string[] = [];
    if (!config.cron || typeof config.cron !== 'string') {
      errors.push('Cron expression is required');
    }
    // Validate cron syntax
    return { valid: errors.length === 0, errors };
  }

  async activate(): Promise<TriggerActivationResult> {
    // Schedule is stored, external scheduler polls for active schedules
    return { success: true };
  }

  async deactivate(): Promise<void> {
    // Remove schedule
  }

  async isActive(): Promise<boolean> {
    // Check if schedule exists
  }

  /**
   * Get workflows that should run at a given time.
   * Called by the scheduler (external or future worker).
   */
  async getDueWorkflows(at: Date): Promise<string[]> {
    // Return workflow IDs that match the cron schedule
  }
}
```

### Trigger → Workflow Execution Integration

The trigger system integrates with the existing workflow executor:

```typescript
// packages/workflow-core/src/trigger-system/trigger-executor.ts

export class TriggerExecutor {
  constructor(
    private readonly triggerRegistry: TriggerTypeRegistry,
    private readonly workflowExecutor: WorkflowExecutor,
  ) {}

  /**
   * Execute a workflow via a trigger.
   */
  async executeViaTrigger(
    triggerContext: TriggerContext,
    workflowDefinition: WorkflowDefinition,
    inputMapping?: Record<string, unknown>,
  ): Promise<ExecutionResult> {
    // Map trigger payload to workflow input
    const input = this.mapTriggerInput(triggerContext, inputMapping);

    // Execute workflow
    return this.workflowExecutor.execute(
      triggerContext.workflowId,
      triggerContext.eventId,
      workflowDefinition,
      input,
    );
  }

  /**
   * Map trigger payload to workflow input.
   */
  private mapTriggerInput(context: TriggerContext, mapping?: Record<string, unknown>): unknown {
    if (mapping) {
      // Apply mapping rules
      return this.applyMapping(context.payload, mapping);
    }
    // Default: pass trigger payload as input
    return {
      trigger: {
        type: context.triggerType,
        payload: context.payload,
        firedAt: context.firedAt.toISOString(),
      },
    };
  }

  private applyMapping(payload: unknown, mapping: Record<string, unknown>): unknown {
    // Future: implement JSONata or template-based mapping
    return payload;
  }
}
```

### Execution Context Update

The execution context gains trigger information:

```typescript
// packages/workflow-core/src/types.ts (updated)

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  input: unknown;
  nodeResults: Map<string, unknown>;
  currentNodeId: string;
  startedAt: Date;
  /** Trigger context (if workflow was started by a trigger) */
  triggerContext?: TriggerContext;
}
```

### API Endpoints

| Method | Path                                                           | Description                  |
| ------ | -------------------------------------------------------------- | ---------------------------- |
| GET    | `/api/v1/trigger-types`                                        | List available trigger types |
| GET    | `/api/v1/projects/:projectId/workflows/:id/trigger`            | Get workflow trigger config  |
| PUT    | `/api/v1/projects/:projectId/workflows/:id/trigger`            | Update workflow trigger      |
| POST   | `/api/v1/projects/:projectId/workflows/:id/trigger/activate`   | Activate trigger             |
| POST   | `/api/v1/projects/:projectId/workflows/:id/trigger/deactivate` | Deactivate trigger           |
| GET    | `/api/v1/projects/:projectId/workflows/:id/trigger/status`     | Get trigger status           |
| POST   | `/api/v1/webhooks/:token`                                      | Execute workflow via webhook |

### Database Changes

```prisma
model Workflow {
  // ... existing fields ...

  /** Trigger configuration */
  trigger Json?  // WorkflowTrigger (type + config + enabled)
}

model WorkflowExecution {
  // ... existing fields ...

  /** Trigger context for this execution */
  triggerType String?  @map("trigger_type")
  triggerData Json?    @map("trigger_data")
}
```

**Note:** The trigger definition is stored in the workflow's `definition` JSON field as part of the `WorkflowDefinition`. The `trigger` field on the Workflow model is optional and stores the resolved trigger configuration separately for queryability.

### File Structure

#### packages/workflow-core (framework-independent)

```
packages/workflow-core/src/
├── trigger-system/
│   ├── trigger-type.interface.ts         # TriggerTypeDefinition, TriggerHandler, etc.
│   ├── trigger-type-registry.ts          # Registry of trigger types
│   ├── trigger-type-registry.spec.ts
│   ├── trigger-executor.ts               # Trigger → workflow execution
│   ├── trigger-executor.spec.ts
│   ├── triggers/
│   │   ├── manual.trigger.ts             # Manual trigger (always available)
│   │   ├── manual.trigger.spec.ts
│   │   ├── webhook.trigger.ts            # Webhook trigger
│   │   ├── webhook.trigger.spec.ts
│   │   ├── scheduled.trigger.ts          # Scheduled/cron trigger
│   │   ├── scheduled.trigger.spec.ts
│   │   └── index.ts                      # Barrel export
│   └── index.ts                          # Barrel export
├── types.ts                              # Updated with WorkflowTrigger
├── executor.ts                           # Updated with TriggerContext
└── index.ts                              # Updated exports
```

#### apps/api (NestJS)

```
apps/api/src/
├── modules/
│   └── triggers/
│       ├── triggers.module.ts
│       ├── triggers.service.ts           # Trigger management
│       ├── triggers.controller.ts        # API endpoints
│       ├── triggers.service.spec.ts
│       ├── triggers.controller.spec.ts
│       └── dto/
│           ├── update-trigger.dto.ts
│           └── index.ts
│   └── webhooks/
│       ├── webhooks.module.ts
│       ├── webhooks.controller.ts        # Webhook execution endpoint
│       ├── webhooks.service.ts
│       ├── webhooks.controller.spec.ts
│       └── webhooks.service.spec.ts
```

## Dependencies

### New Dependencies

None. The trigger system uses:

- Node.js built-in `crypto` for HMAC webhook validation
- Existing `@devflow/workflow-core` infrastructure

### Updated Dependencies

None.

## Environment Variables

| Variable                 | Required | Description                                                       |
| ------------------------ | -------- | ----------------------------------------------------------------- |
| `WEBHOOK_BASE_URL`       | No       | Base URL for webhook endpoints (default: `http://localhost:3000`) |
| `WEBHOOK_SECRET_DEFAULT` | No       | Default webhook secret if not configured per workflow             |

## Security Considerations

| Concern             | Mitigation                                            |
| ------------------- | ----------------------------------------------------- |
| Webhook spoofing    | HMAC-SHA256 signature validation with shared secret   |
| Replay attacks      | Event ID + timestamp validation, idempotency checks   |
| Unauthorized access | Webhook secret required by default                    |
| Payload tampering   | HMAC signature covers entire payload                  |
| DoS via webhook     | Rate limiting (Phase 14), execution timeout           |
| Secret exposure     | Secrets encrypted at rest (Phase 5)                   |
| Path traversal      | Webhook paths are auto-generated, not user-controlled |

## Idempotency Strategy

Webhook triggers must handle duplicate deliveries:

1. **Event ID** — Each webhook delivery includes a unique event ID
2. **Deduplication window** — Configurable (default: 5 minutes)
3. **Execution dedup** — Same event ID + workflow ID = skip execution
4. **Storage** — Deduplication keys stored in memory or cache (future: Redis)

```typescript
// In WebhookTriggerHandler or API layer
const deduplicationKey = `${workflowId}:${eventId}`;
if (await this.isDuplicate(deduplicationKey)) {
  return { status: 'skipped', reason: 'duplicate' };
}
await this.markProcessed(deduplicationKey, deduplicationWindowMs);
```

## Testing Strategy

### Unit Tests (workflow-core)

- **TriggerTypeRegistry:**
  - Registers and retrieves trigger types
  - Rejects duplicate registration

- **ManualTriggerHandler:**
  - Always activates successfully
  - Always reports as active

- **WebhookTriggerHandler:**
  - Validates configuration correctly
  - Generates unique webhook URLs
  - Validates HMAC signatures
  - Rejects invalid secrets

- **ScheduledTriggerHandler:**
  - Validates cron expressions
  - Identifies due workflows

- **TriggerExecutor:**
  - Maps trigger payload to workflow input
  - Passes trigger context to execution

### Unit Tests (API)

- **TriggersService:**
  - Updates trigger configuration
  - Activates/deactivates triggers
  - Returns trigger status

- **WebhooksService:**
  - Processes valid webhook requests
  - Rejects invalid signatures
  - Handles duplicate deliveries

- **TriggersController:**
  - CRUD endpoints work
  - Activation/deactivation works

- **WebhooksController:**
  - POST /webhooks/:token executes workflow
  - Returns proper error responses

### Integration Tests

- Complete webhook flow (send request → workflow executes)
- Manual trigger flow
- Trigger activation/deactivation cycle
- Idempotency (duplicate webhook = single execution)

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

| Risk                        | Likelihood | Impact | Mitigation                                   |
| --------------------------- | ---------- | ------ | -------------------------------------------- |
| Cron expression parsing     | Medium     | Low    | Use standard cron library or simple parser   |
| Webhook URL collision       | Low        | Medium | UUID-based tokens, not sequential            |
| Memory leak from dedup      | Medium     | Low    | TTL-based cleanup, configurable window       |
| Trigger state sync          | Medium     | Medium | Single source of truth in database           |
| Future scheduler complexity | High       | Medium | Architecture designed for external scheduler |

## How Future Trigger Types Are Added

Adding a new trigger type requires:

1. Create `packages/workflow-core/src/trigger-system/triggers/{type}.trigger.ts`
2. Define `TriggerTypeDefinition` with config schema
3. Implement `TriggerHandler` interface
4. Register in `TriggerTypeRegistry`
5. No changes to core trigger architecture

**Example: GitHub Push Trigger (future)**

```typescript
export const githubPushTriggerDefinition: TriggerTypeDefinition = {
  type: 'github-push',
  displayName: 'GitHub Push',
  description: 'Execute workflow on GitHub push events',
  category: 'event',
  version: 1,
  configSchema: {
    type: 'object',
    properties: {
      repository: { type: 'string', description: 'Repository (owner/repo)' },
      branch: { type: 'string', description: 'Branch filter (e.g., "main")' },
      secret: { type: 'string', description: 'GitHub webhook secret' },
    },
    required: ['repository', 'secret'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      ref: { type: 'string' },
      commits: { type: 'array' },
      repository: { type: 'object' },
    },
  },
  requiresAuth: true,
  hasEndpoint: true,
  supportedStatuses: ['active'],
};
```

## How Triggers Appear in Visual Builder

Triggers are displayed as special nodes in the visual workflow builder:

- **Trigger node** — Always at the start of the workflow
- **Visual indicator** — Different icon/color from regular nodes
- **Configuration panel** — Shows trigger-specific settings
- **Status indicator** — Shows if trigger is active/inactive

The trigger is NOT a regular node — it's metadata on the workflow definition. The builder reads `workflow.trigger` and displays it appropriately.

## How Code Generator Consumes Triggers

The code generator reads trigger definitions to generate framework-specific code:

```typescript
// Future code generator reads:
const trigger = workflow.definition.trigger;

// Generates Laravel code:
// - routes/web.php: Webhook route
// - app/Http/Controllers/WebhookController.php: Webhook handler
// - app/Services/TriggerService.php: Trigger validation

// Generates NestJS code:
// - src/modules/webhooks/webhooks.controller.ts: Webhook endpoint
// - src/modules/webhooks/webhooks.guard.ts: HMAC validation
// - src/modules/webhooks/webhooks.service.ts: Trigger orchestration
```

## Known Limitations

- No background worker for scheduled triggers (requires external scheduler)
- No event bus for event-based triggers (future integration)
- No parallel trigger execution (sequential only)
- No trigger chaining (one trigger per workflow initially)
- No webhook analytics/dashboard

## Files Changed

| File                                                                      | Action                                |
| ------------------------------------------------------------------------- | ------------------------------------- |
| `packages/workflow-core/src/trigger-system/trigger-type.interface.ts`     | Created                               |
| `packages/workflow-core/src/trigger-system/trigger-type-registry.ts`      | Created                               |
| `packages/workflow-core/src/trigger-system/trigger-executor.ts`           | Created                               |
| `packages/workflow-core/src/trigger-system/triggers/manual.trigger.ts`    | Created                               |
| `packages/workflow-core/src/trigger-system/triggers/webhook.trigger.ts`   | Created                               |
| `packages/workflow-core/src/trigger-system/triggers/scheduled.trigger.ts` | Created                               |
| `packages/workflow-core/src/trigger-system/triggers/index.ts`             | Created                               |
| `packages/workflow-core/src/trigger-system/index.ts`                      | Created                               |
| `packages/workflow-core/src/trigger-system/*.spec.ts`                     | Created                               |
| `packages/workflow-core/src/types.ts`                                     | Modified (add WorkflowTrigger)        |
| `packages/workflow-core/src/index.ts`                                     | Modified (add exports)                |
| `apps/api/prisma/schema.prisma`                                           | Modified (add trigger fields)         |
| `apps/api/src/modules/triggers/`                                          | Created (module, service, controller) |
| `apps/api/src/modules/webhooks/`                                          | Created (module, service, controller) |
| `apps/api/src/app.module.ts`                                              | Modified (add modules)                |

## Completion Checklist

- [x] Plan approved by human
- [x] TriggerTypeDefinition interface defined
- [x] TriggerHandler interface defined
- [x] TriggerTypeRegistry implemented
- [x] ManualTriggerHandler implemented
- [x] WebhookTriggerHandler implemented
- [x] ScheduledTriggerHandler implemented
- [x] TriggerExecutor implemented
- [x] WorkflowDefinition updated with trigger field
- [x] TriggersModule created in API
- [x] WebhooksModule created in API
- [x] API endpoints work
- [x] Webhook HMAC validation works
- [x] Idempotency works
- [x] Unit tests pass
- [x] Integration tests pass
- [x] `pnpm test` passes
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [x] Documentation updated
