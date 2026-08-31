import type {
  Framework,
  ApplicationDefinition,
  CompilationOptions,
  CompilationResult,
} from '../../codegen-types';
import type { FrameworkAdapter } from '../../framework-adapter';
/**
 * Plain TypeScript adapter — generates TypeScript interfaces and types
 * from resource definitions. No external dependencies.
 */
export declare class TypeScriptAdapter implements FrameworkAdapter {
  readonly framework: Framework;
  private templateEngine;
  constructor();
  compile(definition: ApplicationDefinition, options: CompilationOptions): CompilationResult;
  getFileExtensions(): string[];
  /**
   * Generate all files for a single resource.
   */
  private generateResourceFiles;
  /**
   * Generate a TypeScript interface for a resource.
   */
  private generateInterface;
  /**
   * Generate a CreateInput type for a resource.
   */
  private generateCreateInput;
  /**
   * Generate an UpdateInput type for a resource.
   */
  private generateUpdateInput;
  /**
   * Generate an index file that re-exports all resource types.
   */
  private generateIndexFile;
  /**
   * Map a resource field type to a TypeScript type string.
   */
  private mapToTsType;
  /**
   * Convert PascalCase name to kebab-case file name.
   */
  private toFileName;
}
//# sourceMappingURL=typescript.adapter.d.ts.map
