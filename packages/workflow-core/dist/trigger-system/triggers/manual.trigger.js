/**
 * Manual Trigger
 *
 * Always-available trigger type for direct workflow execution.
 * No configuration required, always active.
 */
/**
 * Manual trigger definition
 */
export const manualTriggerDefinition = {
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
            input: {
                type: 'object',
                description: 'Input provided at execution time',
            },
        },
    },
    requiresAuth: false,
    hasEndpoint: false,
    supportedStatuses: ['active', 'draft'],
};
/**
 * Manual trigger handler
 *
 * Always active, no-op activation/deactivation.
 */
export class ManualTriggerHandler {
    type = 'manual';
    validateConfig() {
        return { valid: true, errors: [] };
    }
    async activate() {
        return { success: true };
    }
    async deactivate() {
        // No-op for manual trigger
    }
    async isActive() {
        return true; // Manual trigger is always active
    }
}
//# sourceMappingURL=manual.trigger.js.map