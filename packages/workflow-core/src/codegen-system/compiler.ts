import type {
  Framework,
  ApplicationDefinition,
  CompilationOptions,
  CompilationResult,
  CompilationMetadata,
} from './codegen-types';
import type { FrameworkAdapter } from './framework-adapter';

/**
 * Compiler pipeline that orchestrates code generation.
 * Routes definitions to the appropriate framework adapter.
 */
export class Compiler {
  private adapters = new Map<Framework, FrameworkAdapter>();

  /**
   * Register a framework adapter.
   */
  registerAdapter(adapter: FrameworkAdapter): void {
    this.adapters.set(adapter.framework, adapter);
  }

  /**
   * Compile an application definition for a target framework.
   */
  compile(definition: ApplicationDefinition, options: CompilationOptions): CompilationResult {
    const adapter = this.adapters.get(options.framework);

    if (!adapter) {
      return {
        success: false,
        files: [],
        warnings: [],
        errors: [`No adapter registered for framework: ${options.framework}`],
        metadata: this.createMetadata(options, definition, 0),
      };
    }

    // Validate definition
    const validationErrors = this.validateDefinition(definition);
    if (validationErrors.length > 0) {
      return {
        success: false,
        files: [],
        warnings: [],
        errors: validationErrors,
        metadata: this.createMetadata(options, definition, 0),
      };
    }

    // Delegate to adapter
    return adapter.compile(definition, options);
  }

  /**
   * Get available frameworks.
   */
  getAvailableFrameworks(): Framework[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if a framework is registered.
   */
  hasAdapter(framework: Framework): boolean {
    return this.adapters.has(framework);
  }

  /**
   * Validate an application definition.
   */
  private validateDefinition(definition: ApplicationDefinition): string[] {
    const errors: string[] = [];

    if (!definition.name || typeof definition.name !== 'string') {
      errors.push('Application name is required');
    }

    if (!definition.resources || !Array.isArray(definition.resources)) {
      errors.push('Resources must be an array');
    }

    if (!definition.components || !Array.isArray(definition.components)) {
      errors.push('Components must be an array');
    }

    // Validate resource names are PascalCase
    if (definition.resources) {
      for (const resource of definition.resources) {
        if (!resource.name || !/^[A-Z][a-zA-Z0-9]*$/.test(resource.name)) {
          errors.push(`Resource name "${resource.name}" must be PascalCase`);
        }
        if (!resource.fields || resource.fields.length === 0) {
          errors.push(`Resource "${resource.name}" must have at least one field`);
        }
      }
    }

    return errors;
  }

  /**
   * Create metadata for a compilation result.
   */
  private createMetadata(
    options: CompilationOptions,
    definition: ApplicationDefinition,
    fileCount: number,
  ): CompilationMetadata {
    return {
      framework: options.framework,
      version: options.version,
      resourceCount: definition.resources?.length ?? 0,
      componentCount: definition.components?.length ?? 0,
      fileCount,
      generatedAt: new Date(),
    };
  }
}
