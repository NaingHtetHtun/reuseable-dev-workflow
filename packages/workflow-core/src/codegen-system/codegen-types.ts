/** Target framework for code generation */
export type Framework = 'typescript' | 'laravel' | 'nestjs';

/** A generated file */
export interface GeneratedFile {
  /** Relative file path (e.g., 'types/category.ts') */
  path: string;
  /** File content */
  content: string;
  /** File description for documentation */
  description?: string;
}

/** Compilation options */
export interface CompilationOptions {
  /** Target framework */
  framework: Framework;
  /** Framework version (e.g., '12' for Laravel, '10' for NestJS) */
  version?: string;
  /** Output directory prefix */
  outputPrefix?: string;
  /** Whether to include comments in generated code */
  includeComments?: boolean;
}

/** Result of a compilation */
export interface CompilationResult {
  /** Whether compilation succeeded */
  success: boolean;
  /** Generated files */
  files: GeneratedFile[];
  /** Compilation warnings (non-fatal) */
  warnings: string[];
  /** Compilation errors (fatal) */
  errors: string[];
  /** Metadata about the compilation */
  metadata: CompilationMetadata;
}

/** Metadata about a compilation */
export interface CompilationMetadata {
  framework: Framework;
  version?: string;
  resourceCount: number;
  componentCount: number;
  fileCount: number;
  generatedAt: Date;
}

/** Application definition — unified input for the compiler */
export interface ApplicationDefinition {
  /** Application name */
  name: string;
  /** Description */
  description?: string;
  /** Resources to generate code for */
  resources: ResourceDefinitionForCodegen[];
  /** Components to generate code for */
  components: ComponentDefinitionForCodegen[];
}

/** Simplified resource definition for codegen (avoids circular deps) */
export interface ResourceDefinitionForCodegen {
  name: string;
  displayName: string;
  description?: string;
  tableName?: string;
  fields: ResourceFieldForCodegen[];
}

/** Simplified field definition for codegen */
export interface ResourceFieldForCodegen {
  name: string;
  displayName: string;
  type: string;
  required: boolean;
  unique?: boolean;
  default?: unknown;
  description?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  enum?: string[];
  relationResource?: string;
  relationType?: string;
}

/** Simplified component definition for codegen */
export interface ComponentDefinitionForCodegen {
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}
