/**
 * Scheduled Trigger
 *
 * Cron/time-based trigger definition.
 * Execution is handled by external scheduler.
 */
import { TriggerTypeDefinition, TriggerHandler, ValidationResult, TriggerActivationResult } from '../trigger-type.interface';
/**
 * Scheduled trigger definition
 */
export declare const scheduledTriggerDefinition: TriggerTypeDefinition;
/**
 * Schedule configuration stored per workflow
 */
interface ScheduleConfig {
    workflowId: string;
    cron: string;
    timezone: string;
    enabled: boolean;
}
/**
 * Scheduled trigger handler
 *
 * Manages cron schedules for workflows.
 * Does not execute workflows directly - external scheduler polls for due workflows.
 */
export declare class ScheduledTriggerHandler implements TriggerHandler {
    readonly type = "scheduled";
    /**
     * In-memory storage for schedule configurations.
     * In production, this would be database-backed.
     */
    private readonly schedules;
    validateConfig(config: Record<string, unknown>): ValidationResult;
    activate(workflowId: string, config: Record<string, unknown>): Promise<TriggerActivationResult>;
    deactivate(workflowId: string): Promise<void>;
    isActive(workflowId: string): Promise<boolean>;
    /**
     * Get schedule configuration for a workflow.
     */
    getSchedule(workflowId: string): ScheduleConfig | undefined;
    /**
     * Get all active schedules.
     */
    getActiveSchedules(): ScheduleConfig[];
    /**
     * Get workflows that should run at a given time.
     * Called by the scheduler (external or future worker).
     *
     * This is a simplified implementation that checks if the current time
     * matches the cron schedule. In production, use a proper cron parser.
     */
    getDueWorkflows(at: Date): Promise<string[]>;
    /**
     * Simple cron matching for common patterns.
     * Handles: wildcard, step, specific value, range, comma-separated.
     *
     * NOTE: This is a simplified implementation for MVP.
     * Production should use a proper cron parsing library.
     */
    private matchesCron;
    /**
     * Check if a cron field matches a value.
     */
    private matchesCronField;
}
export {};
//# sourceMappingURL=scheduled.trigger.d.ts.map