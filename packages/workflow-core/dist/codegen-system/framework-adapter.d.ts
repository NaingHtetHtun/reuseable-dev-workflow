import type { Framework, ApplicationDefinition, CompilationOptions, CompilationResult } from './codegen-types';
/**
 * Interface that framework-specific code generators implement.
 * Each adapter translates the application definition into framework-specific code.
 */
export interface FrameworkAdapter {
    /** Framework identifier */
    readonly framework: Framework;
    /**
     * Generate code from an application definition.
     */
    compile(definition: ApplicationDefinition, options: CompilationOptions): CompilationResult;
    /** Get supported file extensions for this framework */
    getFileExtensions(): string[];
}
//# sourceMappingURL=framework-adapter.d.ts.map