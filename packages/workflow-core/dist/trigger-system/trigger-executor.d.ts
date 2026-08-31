/**
 * Trigger Executor
 *
 * Integrates triggers with workflow execution.
 * Maps trigger payloads to workflow input.
 */
import { WorkflowExecutor, ExecutionResult } from '../executor';
import { WorkflowDefinition } from '../types';
import { TriggerTypeRegistry } from './trigger-type-registry';
import { TriggerContext } from './trigger-type.interface';
/**
 * Input mapping configuration
 */
export interface TriggerInputMapping {
    /** Source path in trigger payload (dot notation) */
    source: string;
    /** Target field name in workflow input */
    target: string;
}
/**
 * Trigger Executor
 *
 * Executes workflows via triggers, mapping trigger payloads to workflow input.
 */
export declare class TriggerExecutor {
    private readonly triggerRegistry;
    private readonly workflowExecutor;
    constructor(triggerRegistry: TriggerTypeRegistry, workflowExecutor: WorkflowExecutor);
    /**
     * Execute a workflow via a trigger.
     */
    executeViaTrigger(triggerContext: TriggerContext, workflowDefinition: WorkflowDefinition, inputMapping?: TriggerInputMapping[]): Promise<ExecutionResult>;
    /**
     * Map trigger payload to workflow input.
     */
    private mapTriggerInput;
    /**
     * Apply mapping rules to transform trigger payload.
     */
    private applyMapping;
    /**
     * Get nested value using dot notation.
     */
    private getNestedValue;
    /**
     * Create a TriggerContext from incoming data.
     */
    static createTriggerContext(workflowId: string, triggerType: string, triggerConfig: Record<string, unknown>, payload: unknown, endpoint?: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        secret?: string;
    }): TriggerContext;
}
//# sourceMappingURL=trigger-executor.d.ts.map