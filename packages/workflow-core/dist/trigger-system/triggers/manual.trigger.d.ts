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
export declare const manualTriggerDefinition: TriggerTypeDefinition;
/**
 * Manual trigger handler
 *
 * Always active, no-op activation/deactivation.
 */
export declare class ManualTriggerHandler implements TriggerHandler {
  readonly type = 'manual';
  validateConfig(): ValidationResult;
  activate(): Promise<TriggerActivationResult>;
  deactivate(): Promise<void>;
  isActive(): Promise<boolean>;
}
//# sourceMappingURL=manual.trigger.d.ts.map
