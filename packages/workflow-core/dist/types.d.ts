export interface WorkflowDefinition {
    /** Trigger configuration (how this workflow starts) */
    trigger?: WorkflowTrigger;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    viewport?: {
        x: number;
        y: number;
        zoom: number;
    };
}
export interface WorkflowTrigger {
    /** Trigger type identifier (e.g., 'manual', 'webhook', 'scheduled') */
    type: string;
    /** Trigger-specific configuration */
    config: Record<string, unknown>;
    /** Whether this trigger is enabled */
    enabled: boolean;
}
export interface WorkflowNode {
    id: string;
    type: string;
    name: string;
    parameters: Record<string, unknown>;
    position?: {
        x: number;
        y: number;
    };
    credentialIds?: string[];
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceOutput?: number;
    condition?: Record<string, unknown>;
}
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
}
export interface NodeExecutionResult {
    nodeId: string;
    output: unknown;
}
//# sourceMappingURL=types.d.ts.map