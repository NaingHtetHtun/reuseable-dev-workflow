import type { ResourceDefinition } from './resource-types';
/**
 * Generates Prisma schema from resource definitions.
 */
export declare class PrismaGenerator {
  /**
   * Generate a Prisma model string from a resource definition.
   */
  generateModel(resource: ResourceDefinition): string;
  /**
   * Generate a field line for a Prisma model.
   */
  private generateFieldLine;
  /**
   * Map a ResourceField type to a Prisma type.
   */
  private mapFieldType;
  /**
   * Format a default value for Prisma.
   */
  private formatDefault;
  /**
   * Generate the full Prisma schema for a list of resources.
   */
  generateSchema(resources: ResourceDefinition[]): string;
  /**
   * Convert PascalCase to snake_case.
   */
  private toSnakeCase;
  /**
   * Get padding string for alignment.
   */
  private getPadding;
}
//# sourceMappingURL=prisma-generator.d.ts.map
