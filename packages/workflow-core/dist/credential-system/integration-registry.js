import { validateCredentialData, } from './credential-types';
/**
 * Registry of credential types for external integrations.
 *
 * Framework-independent — can be used by the API, code generator, and visual builder.
 */
export class IntegrationRegistry {
    types = new Map();
    /**
     * Register a credential type definition.
     */
    register(definition) {
        if (this.types.has(definition.type)) {
            throw new Error(`Credential type already registered: ${definition.type}`);
        }
        this.types.set(definition.type, definition);
    }
    /**
     * Get a credential type definition by type string.
     */
    get(type) {
        return this.types.get(type);
    }
    /**
     * Check if a credential type is registered.
     */
    hasType(type) {
        return this.types.has(type);
    }
    /**
     * Get all registered credential type definitions.
     */
    getAll() {
        return Array.from(this.types.values());
    }
    /**
     * Get definitions by category.
     */
    getByCategory(category) {
        return this.getAll().filter((d) => d.category === category);
    }
    /**
     * Validate credential data against a registered credential type.
     */
    validateCredential(type, data) {
        const definition = this.types.get(type);
        if (!definition) {
            return { valid: false, errors: [`Unknown credential type: ${type}`] };
        }
        return validateCredentialData(definition, data);
    }
    /**
     * Get all secret field names for a credential type.
     */
    getSecretFieldNames(type) {
        const definition = this.types.get(type);
        if (!definition) {
            return [];
        }
        return definition.secretFields.map((f) => f.name);
    }
    /**
     * Get all metadata field names for a credential type.
     */
    getMetadataFieldNames(type) {
        const definition = this.types.get(type);
        if (!definition) {
            return [];
        }
        return definition.metadataFields.map((f) => f.name);
    }
}
//# sourceMappingURL=integration-registry.js.map