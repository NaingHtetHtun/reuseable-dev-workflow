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
export class ComponentValidator {
  /**
   * Validate a full component definition.
   */
  validateComponent(component: Partial<ComponentDefinition>): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!component.name || typeof component.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (!/^[a-z0-9-]+$/.test(component.name)) {
      errors.push('Name must contain only lowercase letters, numbers, and hyphens');
    }

    if (!component.displayName || typeof component.displayName !== 'string') {
      errors.push('Display name is required and must be a string');
    }

    // Version format
    if (component.version && !/^\d+\.\d+\.\d+$/.test(component.version)) {
      errors.push('Version must be in semver format (e.g., 1.0.0)');
    }

    // Status
    if (component.status && !['draft', 'published', 'deprecated'].includes(component.status)) {
      errors.push('Status must be one of: draft, published, deprecated');
    }

    // Validate sub-schemas
    if (component.configSchema) {
      const configResult = this.validateConfigSchema(component.configSchema);
      if (!configResult.valid) {
        errors.push(...configResult.errors.map((e) => `configSchema: ${e}`));
      }
    }

    if (component.credentialSchema) {
      const credResult = this.validateCredentialSchema(component.credentialSchema);
      if (!credResult.valid) {
        errors.push(...credResult.errors.map((e) => `credentialSchema: ${e}`));
      }
    }

    if (component.inputSchema) {
      const inputResult = this.validateIoSchema(component.inputSchema, 'input');
      if (!inputResult.valid) {
        errors.push(...inputResult.errors);
      }
    }

    if (component.outputSchema) {
      const outputResult = this.validateIoSchema(component.outputSchema, 'output');
      if (!outputResult.valid) {
        errors.push(...outputResult.errors);
      }
    }

    if (component.implementation) {
      const implResult = this.validateImplementation(component.implementation);
      if (!implResult.valid) {
        errors.push(...implResult.errors.map((e) => `implementation: ${e}`));
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate a configuration schema.
   */
  validateConfigSchema(schema: ComponentConfigSchema): ValidationResult {
    const errors: string[] = [];

    if (schema.type !== 'object') {
      errors.push('Config schema type must be "object"');
    }

    if (!schema.properties || typeof schema.properties !== 'object') {
      errors.push('Config schema must have properties');
    }

    if (schema.required && !Array.isArray(schema.required)) {
      errors.push('Config schema required must be an array');
    }

    // Validate each property
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (!prop.type) {
          errors.push(`Property "${key}" must have a type`);
        }
        if (!prop.displayName) {
          errors.push(`Property "${key}" must have a displayName`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate a credential schema.
   */
  validateCredentialSchema(schema: ComponentCredentialSchema): ValidationResult {
    const errors: string[] = [];

    if (!schema.required || !Array.isArray(schema.required)) {
      errors.push('Credential schema must have a required array');
    } else {
      for (const cred of schema.required) {
        if (!cred.type) {
          errors.push('Credential type is required');
        }
        if (!cred.displayName) {
          errors.push(`Credential "${cred.type}" must have a displayName`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate an input/output schema.
   */
  validateIoSchema(schema: ComponentIoSchema, type: 'input' | 'output'): ValidationResult {
    const errors: string[] = [];

    if (schema.type !== 'object') {
      errors.push(`${type} schema type must be "object"`);
    }

    if (!schema.properties || typeof schema.properties !== 'object') {
      errors.push(`${type} schema must have properties`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate an implementation.
   */
  validateImplementation(implementation: ComponentDefinition['implementation']): ValidationResult {
    const errors: string[] = [];

    if (!implementation.type) {
      errors.push('Implementation type is required');
    } else if (!['workflow', 'node', 'function'].includes(implementation.type)) {
      errors.push('Implementation type must be workflow, node, or function');
    }

    if (implementation.type === 'workflow' && !implementation.workflow) {
      errors.push('Workflow implementation must have a workflow definition');
    }

    if (implementation.type === 'node' && !implementation.node) {
      errors.push('Node implementation must have a node definition');
    }

    if (implementation.type === 'function' && !implementation.function) {
      errors.push('Function implementation must have a function definition');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate a version string is valid semver.
   */
  isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  /**
   * Increment a version string based on the type of change.
   */
  incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
    }
  }
}
