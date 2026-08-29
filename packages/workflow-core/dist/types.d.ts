export interface WorkflowDefinition {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    viewport?: {
        x: number;
        y: number;
        zoom: number;
    };
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
}
export interface NodeExecutionResult {
    nodeId: string;
    output: unknown;
}
//# sourceMappingURL=types.d.ts.map