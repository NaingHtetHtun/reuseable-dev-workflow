/**
 * Trigger Type Registry
 *
 * Manages registration and lookup of trigger types.
 */
import { TriggerTypeDefinition, TriggerHandler } from './trigger-type.interface';
/**
 * Registry entry containing both definition and handler
 */
export interface TriggerRegistryEntry {
  definition: TriggerTypeDefinition;
  handler: TriggerHandler;
}
/**
 * Registry of trigger types
 *
 * Maintains both type definitions (metadata) and handlers (behavior).
 * New trigger types are added by registering a definition and handler.
 */
export declare class TriggerTypeRegistry {
  private readonly types;
  private readonly handlers;
  /**
   * Register a trigger type with its handler.
   */
  register(definition: TriggerTypeDefinition, handler: TriggerHandler): void;
  /**
   * Get both definition and handler for a trigger type.
   */
  get(type: string): TriggerRegistryEntry | undefined;
  /**
   * Check if a trigger type is registered.
   */
  hasType(type: string): boolean;
  /**
   * Get all registered trigger types with their handlers.
   */
  getAll(): TriggerRegistryEntry[];
  /**
   * Get all trigger type definitions (metadata only).
   */
  getDefinitions(): TriggerTypeDefinition[];
  /**
   * Get trigger types by category.
   */
  getByCategory(category: string): TriggerTypeDefinition[];
  /**
   * Get handler for a trigger type.
   */
  getHandler(type: string): TriggerHandler | undefined;
  /**
   * Unregister a trigger type.
   */
  unregister(type: string): boolean;
  /**
   * Get the number of registered trigger types.
   */
  size(): number;
}
//# sourceMappingURL=trigger-type-registry.d.ts.map
