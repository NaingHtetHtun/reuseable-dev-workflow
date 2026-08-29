import { WorkflowDefinition } from './types';
import { NodeRegistry } from './node-system/registry';
import { Logger } from './logger.interface';
export interface ExecutionResult {
    status: 'completed' | 'failed';
    output: unknown;
    error: string | null;
    nodeResults: Record<string, unknown>;
}
export declare class WorkflowExecutor {
    private readonly logger;
    private readonly registry;
    constructor(logger?: Logger);
    getRegistry(): NodeRegistry;
    execute(workflowId: string, executionId: string, definition: WorkflowDefinition, input: unknown): Promise<ExecutionResult>;
    private getNodeInput;
    private executeNode;
    private createDefaultRegistry;
    private topologicalSort;
}
//# sourceMappingURL=executor.d.ts.map