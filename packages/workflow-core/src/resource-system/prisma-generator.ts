import type { ResourceDefinition, ResourceField } from './resource-types';

/**
 * Generates Prisma schema from resource definitions.
 */
export class PrismaGenerator {
  /**
   * Generate a Prisma model string from a resource definition.
   */
  generateModel(resource: ResourceDefinition): string {
    const tableName = resource.tableName ?? this.toSnakeCase(resource.name);
    const lines: string[] = [];

    lines.push(`model ${resource.name} {`);

    // Fields
    lines.push(`  id        String   @id @default(uuid())`);

    for (const field of resource.fields) {
      lines.push(`  ${this.generateFieldLine(field)}`);
    }

    // Timestamps
    lines.push(`  createdAt DateTime @default(now()) @map("created_at")`);
    lines.push(`  updatedAt DateTime @updatedAt @map("updated_at")`);

    lines.push('');

    // Maps
    lines.push(`  @@map("${tableName}")`);

    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Generate a field line for a Prisma model.
   */
  private generateFieldLine(field: ResourceField): string {
    const padding = this.getPadding(field.name, 14);
    const prismaType = this.mapFieldType(field);
    const modifiers: string[] = [];

    if (field.required) {
      modifiers.push('');
    } else {
      modifiers.push('?');
    }

    const attributes: string[] = [];

    if (field.unique) {
      attributes.push('@unique');
    }

    if (field.default !== undefined && field.default !== null) {
      attributes.push(`@default(${this.formatDefault(field)})`);
    }

    if (field.name !== this.toSnakeCase(field.name)) {
      attributes.push(`@map("${field.name}")`);
    }

    const typeStr = prismaType + (field.required ? '' : '?');
    const attrStr = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';

    return `${field.name}${padding} ${typeStr}${attrStr}`;
  }

  /**
   * Map a ResourceField type to a Prisma type.
   */
  private mapFieldType(field: ResourceField): string {
    switch (field.type) {
      case 'string':
        return 'String';
      case 'text':
        return 'String';
      case 'boolean':
        return 'Boolean';
      case 'integer':
        return 'Int';
      case 'float':
        return 'Float';
      case 'timestamp':
        return 'DateTime';
      case 'json':
        return 'Json';
      case 'enum':
        return 'String';
      case 'relation':
        return 'String';
      default:
        return 'String';
    }
  }

  /**
   * Format a default value for Prisma.
   */
  private formatDefault(field: ResourceField): string {
    const value = field.default;

    if (field.type === 'string' || field.type === 'text' || field.type === 'enum') {
      return `"${String(value)}"`;
    }

    if (field.type === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (field.type === 'json') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Generate the full Prisma schema for a list of resources.
   */
  generateSchema(resources: ResourceDefinition[]): string {
    const models = resources.map((r) => this.generateModel(r));
    return models.join('\n\n');
  }

  /**
   * Convert PascalCase to snake_case.
   */
  private toSnakeCase(name: string): string {
    return name
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  /**
   * Get padding string for alignment.
   */
  private getPadding(name: string, targetWidth: number): string {
    const spaces = Math.max(1, targetWidth - name.length);
    return ' '.repeat(spaces);
  }
}
