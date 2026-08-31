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
export class TriggerTypeRegistry {
  private readonly types = new Map<string, TriggerTypeDefinition>();
  private readonly handlers = new Map<string, TriggerHandler>();

  /**
   * Register a trigger type with its handler.
   */
  register(definition: TriggerTypeDefinition, handler: TriggerHandler): void {
    if (this.types.has(definition.type)) {
      throw new Error(`Trigger type '${definition.type}' is already registered`);
    }

    this.types.set(definition.type, definition);
    this.handlers.set(definition.type, handler);
  }

  /**
   * Get both definition and handler for a trigger type.
   */
  get(type: string): TriggerRegistryEntry | undefined {
    const definition = this.types.get(type);
    const handler = this.handlers.get(type);

    if (!definition || !handler) {
      return undefined;
    }

    return { definition, handler };
  }

  /**
   * Check if a trigger type is registered.
   */
  hasType(type: string): boolean {
    return this.types.has(type);
  }

  /**
   * Get all registered trigger types with their handlers.
   */
  getAll(): TriggerRegistryEntry[] {
    const entries: TriggerRegistryEntry[] = [];

    for (const [type] of this.types) {
      const definition = this.types.get(type)!;
      const handler = this.handlers.get(type)!;
      entries.push({ definition, handler });
    }

    return entries;
  }

  /**
   * Get all trigger type definitions (metadata only).
   */
  getDefinitions(): TriggerTypeDefinition[] {
    return Array.from(this.types.values());
  }

  /**
   * Get trigger types by category.
   */
  getByCategory(category: string): TriggerTypeDefinition[] {
    return this.getDefinitions().filter((def) => def.category === category);
  }

  /**
   * Get handler for a trigger type.
   */
  getHandler(type: string): TriggerHandler | undefined {
    return this.handlers.get(type);
  }

  /**
   * Unregister a trigger type.
   */
  unregister(type: string): boolean {
    const existed = this.types.has(type);
    this.types.delete(type);
    this.handlers.delete(type);
    return existed;
  }

  /**
   * Get the number of registered trigger types.
   */
  size(): number {
    return this.types.size;
  }
}
