/**
 * Manual Trigger
 *
 * Always-available trigger type for direct workflow execution.
 * No configuration required, always active.
 */

import {
  TriggerTypeDefinition,
  TriggerHandler,
  ValidationResult,
  TriggerActivationResult,
} from '../trigger-type.interface';

/**
 * Manual trigger definition
 */
export const manualTriggerDefinition: TriggerTypeDefinition = {
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
export class ManualTriggerHandler implements TriggerHandler {
  readonly type = 'manual';

  validateConfig(): ValidationResult {
    return { valid: true, errors: [] };
  }

  async activate(): Promise<TriggerActivationResult> {
    return { success: true };
  }

  async deactivate(): Promise<void> {
    // No-op for manual trigger
  }

  async isActive(): Promise<boolean> {
    return true; // Manual trigger is always active
  }
}
