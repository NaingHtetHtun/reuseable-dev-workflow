import type { ResourceDefinition, ResourceField } from './resource-types';
/**
 * Generates class-validator decorators and DTO class strings from resource definitions.
 */
export declare class ValidationGenerator {
    /**
     * Generate class-validator decorators for a resource field.
     */
    generateFieldDecorators(field: ResourceField): string[];
    /**
     * Generate a complete DTO class string for a resource.
     */
    generateDto(resource: ResourceDefinition, operation: 'create' | 'update' | 'response'): string;
    /**
     * Collect required validator imports.
     */
    private collectValidatorImports;
    /**
     * Map a ResourceField type to a TypeScript type string.
     */
    private mapToTsType;
    /**
     * Capitalize first letter.
     */
    private capitalize;
}
//# sourceMappingURL=validation-generator.d.ts.map