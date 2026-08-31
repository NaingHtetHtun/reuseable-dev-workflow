import type { ResourceDefinition, ResourceField, ResourceValidationResult } from './resource-types';
/**
 * Validates resource definitions and their fields.
 */
export declare class ResourceValidator {
    /**
     * Validate a full resource definition.
     */
    validateResource(resource: Partial<ResourceDefinition>): ResourceValidationResult;
    /**
     * Validate a single field.
     */
    validateField(field: ResourceField): ResourceValidationResult;
    /**
     * Validate field constraints for a given type.
     */
    validateFieldConstraints(field: ResourceField): ResourceValidationResult;
    /**
     * Validate a version string is valid semver.
     */
    isValidVersion(version: string): boolean;
    /**
     * Increment a version string based on the type of change.
     */
    incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string;
    /**
     * Convert a PascalCase name to snake_case table name.
     */
    toTableName(name: string): string;
}
//# sourceMappingURL=resource-validator.d.ts.map