import { CredentialTypeDefinition, CredentialValidationResult } from './credential-types';
/**
 * Registry of credential types for external integrations.
 *
 * Framework-independent — can be used by the API, code generator, and visual builder.
 */
export declare class IntegrationRegistry {
    private readonly types;
    /**
     * Register a credential type definition.
     */
    register(definition: CredentialTypeDefinition): void;
    /**
     * Get a credential type definition by type string.
     */
    get(type: string): CredentialTypeDefinition | undefined;
    /**
     * Check if a credential type is registered.
     */
    hasType(type: string): boolean;
    /**
     * Get all registered credential type definitions.
     */
    getAll(): CredentialTypeDefinition[];
    /**
     * Get definitions by category.
     */
    getByCategory(category: string): CredentialTypeDefinition[];
    /**
     * Validate credential data against a registered credential type.
     */
    validateCredential(type: string, data: Record<string, unknown>): CredentialValidationResult;
    /**
     * Get all secret field names for a credential type.
     */
    getSecretFieldNames(type: string): string[];
    /**
     * Get all metadata field names for a credential type.
     */
    getMetadataFieldNames(type: string): string[];
}
//# sourceMappingURL=integration-registry.d.ts.map