import type {
  ComponentDefinition,
  ComponentStatus,
  ComponentQuery,
  ComponentListResult,
  ValidationResult,
} from './component-types';
/**
 * In-memory component registry for framework-independent component management.
 * Used by the API layer for validation and metadata operations.
 */
export declare class ComponentRegistry {
  private components;
  /** Register a component */
  register(component: ComponentDefinition): void;
  /** Unregister a component */
  unregister(id: string): boolean;
  /** Get a component by ID */
  get(id: string): ComponentDefinition | undefined;
  /** Get a component by name within a project */
  getByName(projectId: string, name: string): ComponentDefinition | undefined;
  /** Check if a component exists */
  has(id: string): boolean;
  /** Get all components */
  getAll(): ComponentDefinition[];
  /** Get components by project */
  getByProject(projectId: string): ComponentDefinition[];
  /** Get components by category */
  getByCategory(category: string): ComponentDefinition[];
  /** Get components by status */
  getByStatus(status: ComponentStatus): ComponentDefinition[];
  /** Search components by query */
  search(query: string): ComponentDefinition[];
  /** List components with filtering and pagination */
  list(query: ComponentQuery): ComponentListResult;
  /** Get the number of registered components */
  size(): number;
  /** Validate a component definition */
  validate(component: Partial<ComponentDefinition>): ValidationResult;
}
//# sourceMappingURL=component-registry.d.ts.map
