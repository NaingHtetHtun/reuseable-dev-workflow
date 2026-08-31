/**
 * Trigger Executor
 *
 * Integrates triggers with workflow execution.
 * Maps trigger payloads to workflow input.
 */
/**
 * Trigger Executor
 *
 * Executes workflows via triggers, mapping trigger payloads to workflow input.
 */
export class TriggerExecutor {
    triggerRegistry;
    workflowExecutor;
    constructor(triggerRegistry, workflowExecutor) {
        this.triggerRegistry = triggerRegistry;
        this.workflowExecutor = workflowExecutor;
    }
    /**
     * Execute a workflow via a trigger.
     */
    async executeViaTrigger(triggerContext, workflowDefinition, inputMapping) {
        // Map trigger payload to workflow input
        const input = this.mapTriggerInput(triggerContext, inputMapping);
        // Execute workflow
        return this.workflowExecutor.execute(triggerContext.workflowId, triggerContext.eventId, workflowDefinition, input);
    }
    /**
     * Map trigger payload to workflow input.
     */
    mapTriggerInput(context, mapping) {
        if (mapping && mapping.length > 0) {
            // Apply mapping rules
            return this.applyMapping(context.payload, mapping);
        }
        // Default: wrap trigger payload with metadata
        return {
            trigger: {
                type: context.triggerType,
                payload: context.payload,
                firedAt: context.firedAt.toISOString(),
                eventId: context.eventId,
            },
        };
    }
    /**
     * Apply mapping rules to transform trigger payload.
     */
    applyMapping(payload, mapping) {
        const result = {};
        const sourceObj = payload || {};
        for (const map of mapping) {
            const value = this.getNestedValue(sourceObj, map.source);
            if (value !== undefined) {
                result[map.target] = value;
            }
        }
        return result;
    }
    /**
     * Get nested value using dot notation.
     */
    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        return current;
    }
    /**
     * Create a TriggerContext from incoming data.
     */
    static createTriggerContext(workflowId, triggerType, triggerConfig, payload, endpoint) {
        return {
            workflowId,
            triggerType,
            triggerConfig,
            payload,
            firedAt: new Date(),
            eventId: crypto.randomUUID(),
            endpoint,
        };
    }
}
//# sourceMappingURL=trigger-executor.js.map