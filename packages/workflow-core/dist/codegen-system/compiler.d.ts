import type {
  Framework,
  ApplicationDefinition,
  CompilationOptions,
  CompilationResult,
} from './codegen-types';
import type { FrameworkAdapter } from './framework-adapter';
/**
 * Compiler pipeline that orchestrates code generation.
 * Routes definitions to the appropriate framework adapter.
 */
export declare class Compiler {
  private adapters;
  /**
   * Register a framework adapter.
   */
  registerAdapter(adapter: FrameworkAdapter): void;
  /**
   * Compile an application definition for a target framework.
   */
  compile(definition: ApplicationDefinition, options: CompilationOptions): CompilationResult;
  /**
   * Get available frameworks.
   */
  getAvailableFrameworks(): Framework[];
  /**
   * Check if a framework is registered.
   */
  hasAdapter(framework: Framework): boolean;
  /**
   * Validate an application definition.
   */
  private validateDefinition;
  /**
   * Create metadata for a compilation result.
   */
  private createMetadata;
}
//# sourceMappingURL=compiler.d.ts.map
