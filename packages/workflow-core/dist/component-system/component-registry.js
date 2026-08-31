/**
 * In-memory component registry for framework-independent component management.
 * Used by the API layer for validation and metadata operations.
 */
export class ComponentRegistry {
  components = new Map();
  /** Register a component */
  register(component) {
    this.components.set(component.id, component);
  }
  /** Unregister a component */
  unregister(id) {
    return this.components.delete(id);
  }
  /** Get a component by ID */
  get(id) {
    return this.components.get(id);
  }
  /** Get a component by name within a project */
  getByName(projectId, name) {
    for (const component of this.components.values()) {
      if (component.projectId === projectId && component.name === name) {
        return component;
      }
    }
    return undefined;
  }
  /** Check if a component exists */
  has(id) {
    return this.components.has(id);
  }
  /** Get all components */
  getAll() {
    return Array.from(this.components.values());
  }
  /** Get components by project */
  getByProject(projectId) {
    return this.getAll().filter((c) => c.projectId === projectId);
  }
  /** Get components by category */
  getByCategory(category) {
    return this.getAll().filter((c) => c.category === category);
  }
  /** Get components by status */
  getByStatus(status) {
    return this.getAll().filter((c) => c.status === status);
  }
  /** Search components by query */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.displayName.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery) ||
        c.tags.some((t) => t.toLowerCase().includes(lowerQuery)),
    );
  }
  /** List components with filtering and pagination */
  list(query) {
    let results = this.getAll();
    // Filter by project (if specified in query through metadata)
    if (query.search) {
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(query.search.toLowerCase()) ||
          c.displayName.toLowerCase().includes(query.search.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.search.toLowerCase()),
      );
    }
    if (query.category) {
      results = results.filter((c) => c.category === query.category);
    }
    if (query.status) {
      results = results.filter((c) => c.status === query.status);
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter((c) => query.tags.some((t) => c.tags.includes(t)));
    }
    // Pagination
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const total = results.length;
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /** Get the number of registered components */
  size() {
    return this.components.size;
  }
  /** Validate a component definition */
  validate(component) {
    const errors = [];
    if (!component.name) {
      errors.push('Component name is required');
    } else if (!/^[a-z0-9-]+$/.test(component.name)) {
      errors.push('Component name must contain only lowercase letters, numbers, and hyphens');
    }
    if (!component.displayName) {
      errors.push('Display name is required');
    }
    if (component.version && !/^\d+\.\d+\.\d+$/.test(component.version)) {
      errors.push('Version must be in semver format (e.g., 1.0.0)');
    }
    if (component.status && !['draft', 'published', 'deprecated'].includes(component.status)) {
      errors.push('Status must be draft, published, or deprecated');
    }
    if (component.configSchema && component.configSchema.type !== 'object') {
      errors.push('Config schema type must be "object"');
    }
    if (component.credentialSchema && !Array.isArray(component.credentialSchema.required)) {
      errors.push('Credential schema required must be an array');
    }
    if (component.implementation) {
      const impl = component.implementation;
      if (!['workflow', 'node', 'function'].includes(impl.type)) {
        errors.push('Implementation type must be workflow, node, or function');
      }
    }
    return { valid: errors.length === 0, errors };
  }
}
//# sourceMappingURL=component-registry.js.map
