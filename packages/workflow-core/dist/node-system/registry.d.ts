import { NodeTypeDefinition, NodeHandler, ValidationResult } from './interfaces';
export declare class NodeRegistry {
  private definitions;
  private handlers;
  /** Register a node type with its definition and handler */
  register(definition: NodeTypeDefinition, handler: NodeHandler): void;
  /** Get a node type definition */
  getDefinition(type: string): NodeTypeDefinition | undefined;
  /** Get a node handler */
  getHandler(type: string): NodeHandler | undefined;
  /** Check if a node type is registered */
  hasType(type: string): boolean;
  /** Get all registered type definitions */
  getAllDefinitions(): NodeTypeDefinition[];
  /** Get definitions by category */
  getByCategory(category: string): NodeTypeDefinition[];
  /** Validate parameters against a node type's schema */
  validateParameters(type: string, parameters: Record<string, unknown>): ValidationResult;
}
//# sourceMappingURL=registry.d.ts.map
