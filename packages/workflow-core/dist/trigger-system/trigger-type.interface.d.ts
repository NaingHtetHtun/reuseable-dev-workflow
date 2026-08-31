/**
 * Trigger System Interfaces
 *
 * Framework-independent interfaces for workflow triggers.
 * These are reusable by the code generator and other systems.
 */
/**
 * JSON Schema-like configuration property definition
 */
export interface TriggerConfigProperty {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    default?: unknown;
    enum?: unknown[];
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}
/**
 * JSON Schema-like configuration definition
 */
export interface TriggerConfigSchema {
    type: 'object';
    properties: Record<string, TriggerConfigProperty>;
    required?: string[];
}
/**
 * Input/Output schema declaration
 */
export interface IoSchema {
    type: 'object';
    properties: Record<string, {
        type: string;
        description?: string;
    }>;
}
/**
 * Describes a trigger type's capabilities and requirements
 */
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
/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Trigger endpoint information
 */
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
/**
 * Trigger activation result
 */
export interface TriggerActivationResult {
    /** Whether activation was successful */
    success: boolean;
    /** Endpoint info if applicable */
    endpoint?: TriggerEndpointInfo;
    /** Error message if activation failed */
    error?: string;
}
/**
 * The contract a trigger handler must implement
 */
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
/**
 * Context provided when a trigger fires
 */
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
/**
 * Workflow trigger configuration (part of WorkflowDefinition)
 */
export interface WorkflowTrigger {
    /** Trigger type identifier (e.g., 'manual', 'webhook', 'scheduled') */
    type: string;
    /** Trigger-specific configuration */
    config: Record<string, unknown>;
    /** Whether this trigger is enabled */
    enabled: boolean;
}
//# sourceMappingURL=trigger-type.interface.d.ts.map