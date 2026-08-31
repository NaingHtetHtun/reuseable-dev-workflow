/**
 * Trigger System Barrel Export
 */

// Interfaces and types
export * from './trigger-type.interface';

// Registry
export { TriggerTypeRegistry, TriggerRegistryEntry } from './trigger-type-registry';

// Executor
export { TriggerExecutor, TriggerInputMapping } from './trigger-executor';

// Built-in triggers
export {
  manualTriggerDefinition,
  ManualTriggerHandler,
  webhookTriggerDefinition,
  WebhookTriggerHandler,
  scheduledTriggerDefinition,
  ScheduledTriggerHandler,
} from './triggers';
