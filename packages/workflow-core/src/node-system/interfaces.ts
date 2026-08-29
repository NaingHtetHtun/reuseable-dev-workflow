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
  /** Resolve a credential by ID (Phase 5). Returns decrypted credential data. */
  resolveCredential?(id: string): Promise<Record<string, unknown>>;
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
