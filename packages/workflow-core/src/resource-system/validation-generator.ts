import type { ResourceDefinition, ResourceField } from './resource-types';

/**
 * Generates class-validator decorators and DTO class strings from resource definitions.
 */
export class ValidationGenerator {
  /**
   * Generate class-validator decorators for a resource field.
   */
  generateFieldDecorators(field: ResourceField): string[] {
    const decorators: string[] = [];

    // Optional/required
    if (field.required) {
      decorators.push('@IsNotEmpty()');
    } else {
      decorators.push('@IsOptional()');
    }

    // Type-specific decorators
    switch (field.type) {
      case 'string':
      case 'text':
        decorators.push('@IsString()');
        if (field.minLength !== undefined) {
          decorators.push(`@MinLength(${field.minLength})`);
        }
        if (field.maxLength !== undefined) {
          decorators.push(`@MaxLength(${field.maxLength})`);
        }
        if (field.pattern) {
          decorators.push(`@Matches(/${field.pattern}/)`);
        }
        break;

      case 'boolean':
        decorators.push('@IsBoolean()');
        break;

      case 'integer':
        decorators.push('@IsInt()');
        if (field.minimum !== undefined) {
          decorators.push(`@Min(${field.minimum})`);
        }
        if (field.maximum !== undefined) {
          decorators.push(`@Max(${field.maximum})`);
        }
        break;

      case 'float':
        decorators.push('@IsNumber()');
        if (field.minimum !== undefined) {
          decorators.push(`@Min(${field.minimum})`);
        }
        if (field.maximum !== undefined) {
          decorators.push(`@Max(${field.maximum})`);
        }
        break;

      case 'timestamp':
        decorators.push('@IsDateString()');
        break;

      case 'json':
        decorators.push('@IsObject()');
        break;

      case 'enum':
        if (field.enum && field.enum.length > 0) {
          decorators.push(`@IsIn([${field.enum.map((v) => `'${v}'`).join(', ')}])`);
        }
        break;

      case 'relation':
        decorators.push('@IsString()');
        break;
    }

    return decorators;
  }

  /**
   * Generate a complete DTO class string for a resource.
   */
  generateDto(resource: ResourceDefinition, operation: 'create' | 'update' | 'response'): string {
    const className = `${resource.name}${this.capitalize(operation === 'response' ? 'Response' : operation === 'create' ? 'CreateDto' : 'UpdateDto')}`;
    const lines: string[] = [];

    // Imports
    if (operation !== 'response') {
      lines.push(`import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';`);
      const validators = this.collectValidatorImports(resource.fields, operation);
      if (validators.length > 0) {
        lines.push(`import { ${validators.join(', ')} } from 'class-validator';`);
      }
      lines.push('');
    }

    // Class
    lines.push(`export class ${className} {`);

    if (operation === 'response') {
      // Response DTO — all fields are output-only
      lines.push(`  @ApiProperty({ description: 'Resource ID' })`);
      lines.push(`  id!: string;`);
      lines.push('');
      lines.push(`  @ApiProperty({ description: 'Project ID' })`);
      lines.push(`  projectId!: string;`);
      lines.push('');

      for (const field of resource.fields) {
        const optional = !field.required ? 'Optional' : '';
        lines.push(`  @ApiProperty${optional}({ description: '${field.displayName}' })`);
        lines.push(`  ${field.name}!: ${this.mapToTsType(field)};`);
        lines.push('');
      }

      lines.push(`  @ApiProperty({ description: 'Created timestamp' })`);
      lines.push(`  createdAt!: Date;`);
      lines.push('');
      lines.push(`  @ApiProperty({ description: 'Updated timestamp' })`);
      lines.push(`  updatedAt!: Date;`);
    } else {
      // Create/Update DTO
      for (const field of resource.fields) {
        const decorators = this.generateFieldDecorators(field);
        const isOptional = !field.required || operation === 'update';
        const propDecorator = isOptional ? 'ApiPropertyOptional' : 'ApiProperty';

        for (const dec of decorators) {
          lines.push(`  ${dec}`);
        }
        lines.push(`  @${propDecorator}({ description: '${field.displayName}' })`);
        lines.push(`  ${field.name}${isOptional ? '?' : '!'}: ${this.mapToTsType(field)};`);
        lines.push('');
      }
    }

    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Collect required validator imports.
   */
  private collectValidatorImports(fields: ResourceField[], operation: string): string[] {
    const imports = new Set<string>();

    if (operation !== 'response') {
      imports.add('IsOptional');

      for (const field of fields) {
        const isOptional = !field.required || operation === 'update';
        if (!isOptional) {
          imports.add('IsNotEmpty');
        }

        switch (field.type) {
          case 'string':
          case 'text':
          case 'relation':
            imports.add('IsString');
            if (field.minLength !== undefined) imports.add('MinLength');
            if (field.maxLength !== undefined) imports.add('MaxLength');
            if (field.pattern) imports.add('Matches');
            break;
          case 'boolean':
            imports.add('IsBoolean');
            break;
          case 'integer':
            imports.add('IsInt');
            if (field.minimum !== undefined) imports.add('Min');
            if (field.maximum !== undefined) imports.add('Max');
            break;
          case 'float':
            imports.add('IsNumber');
            if (field.minimum !== undefined) imports.add('Min');
            if (field.maximum !== undefined) imports.add('Max');
            break;
          case 'timestamp':
            imports.add('IsDateString');
            break;
          case 'json':
            imports.add('IsObject');
            break;
          case 'enum':
            imports.add('IsIn');
            break;
        }
      }
    }

    return Array.from(imports).sort();
  }

  /**
   * Map a ResourceField type to a TypeScript type string.
   */
  private mapToTsType(field: ResourceField): string {
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
   * Capitalize first letter.
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
