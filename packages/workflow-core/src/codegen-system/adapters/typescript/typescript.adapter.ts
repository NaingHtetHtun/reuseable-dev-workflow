import type {
  Framework,
  ApplicationDefinition,
  CompilationOptions,
  CompilationResult,
  GeneratedFile,
  ResourceDefinitionForCodegen,
  ResourceFieldForCodegen,
} from '../../codegen-types';
import type { FrameworkAdapter } from '../../framework-adapter';
import { TemplateEngine } from '../../template-engine';
import {
  INTERFACE_TEMPLATE,
  CREATE_INPUT_TEMPLATE,
  UPDATE_INPUT_TEMPLATE,
  FILE_HEADER_TEMPLATE,
} from './templates';

/**
 * Plain TypeScript adapter — generates TypeScript interfaces and types
 * from resource definitions. No external dependencies.
 */
export class TypeScriptAdapter implements FrameworkAdapter {
  readonly framework: Framework = 'typescript';
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  compile(definition: ApplicationDefinition, options: CompilationOptions): CompilationResult {
    const files: GeneratedFile[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    const prefix = options.outputPrefix ?? '';

    for (const resource of definition.resources) {
      try {
        const resourceFiles = this.generateResourceFiles(resource, options, prefix);
        files.push(...resourceFiles);
      } catch (err) {
        errors.push(
          `Failed to generate code for resource "${resource.name}": ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Generate index file if multiple resources
    if (definition.resources.length > 1) {
      const indexFile = this.generateIndexFile(definition.resources, prefix, options);
      files.push(indexFile);
    }

    return {
      success: errors.length === 0,
      files,
      warnings,
      errors,
      metadata: {
        framework: 'typescript',
        version: options.version,
        resourceCount: definition.resources.length,
        componentCount: definition.components.length,
        fileCount: files.length,
        generatedAt: new Date(),
      },
    };
  }

  getFileExtensions(): string[] {
    return ['.ts', '.d.ts'];
  }

  /**
   * Generate all files for a single resource.
   */
  private generateResourceFiles(
    resource: ResourceDefinitionForCodegen,
    options: CompilationOptions,
    prefix: string,
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const fileName = this.toFileName(resource.name);
    const filePath = prefix ? `${prefix}/${fileName}.ts` : `${fileName}.ts`;

    // Build the interface content
    const interfaceContent = this.generateInterface(resource, options);

    // Build CreateInput type
    const createInputContent = this.generateCreateInput(resource);

    // Build UpdateInput type
    const updateInputContent = this.generateUpdateInput(resource);

    // Combine with header
    const header = options.includeComments
      ? this.templateEngine.render(FILE_HEADER_TEMPLATE, {
          generatedAt: new Date().toISOString(),
        }) + '\n\n'
      : '';

    const content =
      header + interfaceContent + '\n\n' + createInputContent + '\n\n' + updateInputContent;

    files.push({
      path: filePath,
      content,
      description: `TypeScript types for ${resource.displayName}`,
    });

    return files;
  }

  /**
   * Generate a TypeScript interface for a resource.
   */
  private generateInterface(
    resource: ResourceDefinitionForCodegen,
    options: CompilationOptions,
  ): string {
    const fields = resource.fields.map((f) => ({
      name: f.name,
      tsType: this.mapToTsType(f),
      required: f.required,
      description: options.includeComments ? f.description : undefined,
    }));

    const context: Record<string, unknown> = {
      name: resource.name,
      description: options.includeComments ? resource.description : undefined,
      fields,
    };

    return this.templateEngine.render(INTERFACE_TEMPLATE, context);
  }

  /**
   * Generate a CreateInput type for a resource.
   */
  private generateCreateInput(resource: ResourceDefinitionForCodegen): string {
    return this.templateEngine.render(CREATE_INPUT_TEMPLATE, {
      resourceName: resource.name,
    });
  }

  /**
   * Generate an UpdateInput type for a resource.
   */
  private generateUpdateInput(resource: ResourceDefinitionForCodegen): string {
    return this.templateEngine.render(UPDATE_INPUT_TEMPLATE, {
      resourceName: resource.name,
    });
  }

  /**
   * Generate an index file that re-exports all resource types.
   */
  private generateIndexFile(
    resources: ResourceDefinitionForCodegen[],
    prefix: string,
    options: CompilationOptions,
  ): GeneratedFile {
    const imports = resources
      .map((r) => {
        const fileName = this.toFileName(r.name);
        const importPath = prefix ? `./${prefix}/${fileName}` : `./${fileName}`;
        return `export type { ${r.name}, ${r.name}CreateInput, ${r.name}UpdateInput } from '${importPath}';`;
      })
      .join('\n');

    const header = options.includeComments
      ? this.templateEngine.render(FILE_HEADER_TEMPLATE, {
          generatedAt: new Date().toISOString(),
        }) + '\n\n'
      : '';

    return {
      path: 'index.ts',
      content: header + imports + '\n',
      description: 'Barrel export for all generated types',
    };
  }

  /**
   * Map a resource field type to a TypeScript type string.
   */
  private mapToTsType(field: ResourceFieldForCodegen): string {
    switch (field.type) {
      case 'string':
      case 'text':
      case 'enum':
      case 'relation':
        return 'string';
      case 'boolean':
        return 'boolean';
      case 'integer':
      case 'float':
        return 'number';
      case 'timestamp':
        return 'Date';
      case 'json':
        return 'Record<string, unknown>';
      default:
        return 'unknown';
    }
  }

  /**
   * Convert PascalCase name to kebab-case file name.
   */
  private toFileName(name: string): string {
    return name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }
}
