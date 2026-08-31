/**
 * Scheduled Trigger
 *
 * Cron/time-based trigger definition.
 * Execution is handled by external scheduler.
 */

import {
  TriggerTypeDefinition,
  TriggerHandler,
  ValidationResult,
  TriggerActivationResult,
} from '../trigger-type.interface';

/**
 * Scheduled trigger definition
 */
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
      scheduledTime: {
        type: 'string',
        description: 'Scheduled execution time',
      },
      triggeredAt: {
        type: 'string',
        description: 'Actual trigger time',
      },
    },
  },
  requiresAuth: false,
  hasEndpoint: false,
  supportedStatuses: ['active'],
};

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
 * Cron expression validation patterns
 * Standard 5-field cron: minute hour day-of-month month day-of-week
 */
const CRON_FIELD_PATTERNS = [
  /^(\*|\*\/[0-9]+|([0-9]|[1-5][0-9])(\/[0-9]+)?(-([0-9]|[1-5][0-9]))?(,([0-9]|[1-5][0-9]))*)$/, // minute
  /^(\*|\*\/[0-9]+|([0-9]|1[0-9]|2[0-3])(\/[0-9]+)?(-([0-9]|1[0-9]|2[0-3]))?(,([0-9]|1[0-9]|2[0-3]))*)$/, // hour
  /^(\*|\*\/[0-9]+|([1-9]|[12][0-9]|3[01])(\/[0-9]+)?(-([1-9]|[12][0-9]|3[01]))?(,([1-9]|[12][0-9]|3[01]))*)$/, // day of month
  /^(\*|\*\/[0-9]+|(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|[1-9]|1[0-2])(\/[0-9]+)?(-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|[1-9]|1[0-2]))?(,(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|[1-9]|1[0-2]))*)$/i, // month
  /^(\*|\*\/[0-9]+|([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT)(\/[0-9]+)?(-([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT))?(,([0-6]|SUN|MON|TUE|WED|THU|FRI|SAT))*)$/i, // day of week
];

/**
 * Validate a standard 5-field cron expression
 */
function validateCronExpression(cron: string): string[] {
  const errors: string[] = [];
  const fields = cron.trim().split(/\s+/);

  if (fields.length !== 5) {
    errors.push(`Cron expression must have 5 fields (found ${fields.length})`);
    return errors;
  }

  const fieldNames = ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'];

  for (let i = 0; i < 5; i++) {
    if (!CRON_FIELD_PATTERNS[i].test(fields[i])) {
      errors.push(`Invalid ${fieldNames[i]} field: ${fields[i]}`);
    }
  }

  return errors;
}

/**
 * Scheduled trigger handler
 *
 * Manages cron schedules for workflows.
 * Does not execute workflows directly - external scheduler polls for due workflows.
 */
export class ScheduledTriggerHandler implements TriggerHandler {
  readonly type = 'scheduled';

  /**
   * In-memory storage for schedule configurations.
   * In production, this would be database-backed.
   */
  private readonly schedules = new Map<string, ScheduleConfig>();

  validateConfig(config: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];

    // Validate cron expression is present
    if (!config.cron || typeof config.cron !== 'string') {
      errors.push('Cron expression is required');
      return { valid: false, errors };
    }

    // Validate cron syntax
    const cronErrors = validateCronExpression(config.cron as string);
    errors.push(...cronErrors);

    // Validate timezone if provided
    if (config.timezone && typeof config.timezone !== 'string') {
      errors.push('Timezone must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  async activate(
    workflowId: string,
    config: Record<string, unknown>,
  ): Promise<TriggerActivationResult> {
    const scheduleConfig: ScheduleConfig = {
      workflowId,
      cron: config.cron as string,
      timezone: (config.timezone as string) || 'UTC',
      enabled: true,
    };

    this.schedules.set(workflowId, scheduleConfig);

    return { success: true };
  }

  async deactivate(workflowId: string): Promise<void> {
    this.schedules.delete(workflowId);
  }

  async isActive(workflowId: string): Promise<boolean> {
    const schedule = this.schedules.get(workflowId);
    return schedule?.enabled ?? false;
  }

  /**
   * Get schedule configuration for a workflow.
   */
  getSchedule(workflowId: string): ScheduleConfig | undefined {
    return this.schedules.get(workflowId);
  }

  /**
   * Get all active schedules.
   */
  getActiveSchedules(): ScheduleConfig[] {
    return Array.from(this.schedules.values()).filter((s) => s.enabled);
  }

  /**
   * Get workflows that should run at a given time.
   * Called by the scheduler (external or future worker).
   *
   * This is a simplified implementation that checks if the current time
   * matches the cron schedule. In production, use a proper cron parser.
   */
  async getDueWorkflows(at: Date): Promise<string[]> {
    const due: string[] = [];

    for (const schedule of this.schedules.values()) {
      if (!schedule.enabled) continue;

      if (this.matchesCron(schedule.cron, at)) {
        due.push(schedule.workflowId);
      }
    }

    return due;
  }

  /**
   * Simple cron matching for common patterns.
   * Handles: wildcard, step, specific value, range, comma-separated.
   *
   * NOTE: This is a simplified implementation for MVP.
   * Production should use a proper cron parsing library.
   */
  private matchesCron(cron: string, date: Date): boolean {
    const fields = cron.trim().split(/\s+/);
    if (fields.length !== 5) return false;

    const minute = date.getUTCMinutes();
    const hour = date.getUTCHours();
    const dayOfMonth = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // 1-indexed
    const dayOfWeek = date.getUTCDay(); // 0 = Sunday

    const values = [minute, hour, dayOfMonth, month, dayOfWeek];

    return fields.every((field, i) => this.matchesCronField(field, values[i]));
  }

  /**
   * Check if a cron field matches a value.
   */
  private matchesCronField(field: string, value: number): boolean {
    // Handle comma-separated values
    if (field.includes(',')) {
      return field.split(',').some((f) => this.matchesCronField(f.trim(), value));
    }

    // Handle step (e.g., */5 or */2 in minute/hour)
    if (field.includes('/')) {
      const [base, step] = field.split('/');
      const stepNum = parseInt(step, 10);
      if (base === '*') {
        return value % stepNum === 0;
      }
      // Handle base-range with step (e.g., 1-10/2)
      const [start] = base.split('-').map(Number);
      return value >= start && value % stepNum === 0;
    }

    // Handle range (e.g., 1-5)
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return value >= start && value <= end;
    }

    // Handle wildcard
    if (field === '*') {
      return true;
    }

    // Handle specific value
    return parseInt(field, 10) === value;
  }
}
