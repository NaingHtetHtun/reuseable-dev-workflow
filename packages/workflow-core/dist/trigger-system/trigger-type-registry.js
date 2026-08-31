/**
 * Trigger Type Registry
 *
 * Manages registration and lookup of trigger types.
 */
/**
 * Registry of trigger types
 *
 * Maintains both type definitions (metadata) and handlers (behavior).
 * New trigger types are added by registering a definition and handler.
 */
export class TriggerTypeRegistry {
    types = new Map();
    handlers = new Map();
    /**
     * Register a trigger type with its handler.
     */
    register(definition, handler) {
        if (this.types.has(definition.type)) {
            throw new Error(`Trigger type '${definition.type}' is already registered`);
        }
        this.types.set(definition.type, definition);
        this.handlers.set(definition.type, handler);
    }
    /**
     * Get both definition and handler for a trigger type.
     */
    get(type) {
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
    hasType(type) {
        return this.types.has(type);
    }
    /**
     * Get all registered trigger types with their handlers.
     */
    getAll() {
        const entries = [];
        for (const [type] of this.types) {
            const definition = this.types.get(type);
            const handler = this.handlers.get(type);
            entries.push({ definition, handler });
        }
        return entries;
    }
    /**
     * Get all trigger type definitions (metadata only).
     */
    getDefinitions() {
        return Array.from(this.types.values());
    }
    /**
     * Get trigger types by category.
     */
    getByCategory(category) {
        return this.getDefinitions().filter((def) => def.category === category);
    }
    /**
     * Get handler for a trigger type.
     */
    getHandler(type) {
        return this.handlers.get(type);
    }
    /**
     * Unregister a trigger type.
     */
    unregister(type) {
        const existed = this.types.has(type);
        this.types.delete(type);
        this.handlers.delete(type);
        return existed;
    }
    /**
     * Get the number of registered trigger types.
     */
    size() {
        return this.types.size;
    }
}
//# sourceMappingURL=trigger-type-registry.js.map