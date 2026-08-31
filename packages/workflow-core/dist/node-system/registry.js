export class NodeRegistry {
  definitions = new Map();
  handlers = new Map();
  /** Register a node type with its definition and handler */
  register(definition, handler) {
    if (this.definitions.has(definition.type)) {
      throw new Error(`Node type already registered: ${definition.type}`);
    }
    if (definition.type !== handler.type) {
      throw new Error(
        `Handler type "${handler.type}" does not match definition type "${definition.type}"`,
      );
    }
    this.definitions.set(definition.type, definition);
    this.handlers.set(definition.type, handler);
  }
  /** Get a node type definition */
  getDefinition(type) {
    return this.definitions.get(type);
  }
  /** Get a node handler */
  getHandler(type) {
    return this.handlers.get(type);
  }
  /** Check if a node type is registered */
  hasType(type) {
    return this.definitions.has(type);
  }
  /** Get all registered type definitions */
  getAllDefinitions() {
    return Array.from(this.definitions.values());
  }
  /** Get definitions by category */
  getByCategory(category) {
    return this.getAllDefinitions().filter((d) => d.category === category);
  }
  /** Validate parameters against a node type's schema */
  validateParameters(type, parameters) {
    const definition = this.definitions.get(type);
    if (!definition) {
      return { valid: false, errors: [`Unknown node type: ${type}`] };
    }
    return validateAgainstSchema(definition.parameterSchema, parameters);
  }
}
function validateAgainstSchema(schema, parameters) {
  const errors = [];
  // Check required parameters
  if (schema.required) {
    for (const required of schema.required) {
      if (!(required in parameters)) {
        errors.push(`Missing required parameter: ${required}`);
      }
    }
  }
  // Validate each provided parameter
  for (const [key, value] of Object.entries(parameters)) {
    const paramDef = schema.properties[key];
    if (!paramDef) {
      // Allow extra parameters (extensibility)
      continue;
    }
    // Type check
    if (!matchesType(value, paramDef.type)) {
      errors.push(`Parameter "${key}" expected type "${paramDef.type}" but got "${typeof value}"`);
      continue;
    }
    // Enum check
    if (paramDef.enum && !paramDef.enum.includes(value)) {
      errors.push(`Parameter "${key}" must be one of: ${paramDef.enum.join(', ')}`);
    }
    // Number constraints
    if (paramDef.type === 'number' && typeof value === 'number') {
      if (paramDef.minimum !== undefined && value < paramDef.minimum) {
        errors.push(`Parameter "${key}" must be >= ${paramDef.minimum}`);
      }
      if (paramDef.maximum !== undefined && value > paramDef.maximum) {
        errors.push(`Parameter "${key}" must be <= ${paramDef.maximum}`);
      }
    }
    // String constraints
    if (paramDef.type === 'string' && typeof value === 'string') {
      if (paramDef.minLength !== undefined && value.length < paramDef.minLength) {
        errors.push(`Parameter "${key}" must have length >= ${paramDef.minLength}`);
      }
      if (paramDef.maxLength !== undefined && value.length > paramDef.maxLength) {
        errors.push(`Parameter "${key}" must have length <= ${paramDef.maxLength}`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
function matchesType(value, expectedType) {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return true;
  }
}
//# sourceMappingURL=registry.js.map
