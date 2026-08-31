import type {
  ComponentDefinition,
  ComponentConfigSchema,
  ComponentCredentialSchema,
  ComponentIoSchema,
  ValidationResult,
} from './component-types';
/**
 * Validates component definitions and their sub-schemas.
 */
export declare class ComponentValidator {
  /**
   * Validate a full component definition.
   */
  validateComponent(component: Partial<ComponentDefinition>): ValidationResult;
  /**
   * Validate a configuration schema.
   */
  validateConfigSchema(schema: ComponentConfigSchema): ValidationResult;
  /**
   * Validate a credential schema.
   */
  validateCredentialSchema(schema: ComponentCredentialSchema): ValidationResult;
  /**
   * Validate an input/output schema.
   */
  validateIoSchema(schema: ComponentIoSchema, type: 'input' | 'output'): ValidationResult;
  /**
   * Validate an implementation.
   */
  validateImplementation(implementation: ComponentDefinition['implementation']): ValidationResult;
  /**
   * Validate a version string is valid semver.
   */
  isValidVersion(version: string): boolean;
  /**
   * Increment a version string based on the type of change.
   */
  incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string;
}
//# sourceMappingURL=component-validator.d.ts.map
