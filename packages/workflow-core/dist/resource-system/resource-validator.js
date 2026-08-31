const VALID_FIELD_TYPES = [
    'string',
    'text',
    'boolean',
    'integer',
    'float',
    'timestamp',
    'json',
    'enum',
    'relation',
];
/**
 * Validates resource definitions and their fields.
 */
export class ResourceValidator {
    /**
     * Validate a full resource definition.
     */
    validateResource(resource) {
        const errors = [];
        // Required fields
        if (!resource.name || typeof resource.name !== 'string') {
            errors.push('Resource name is required and must be a string');
        }
        else if (!/^[A-Z][a-zA-Z0-9]*$/.test(resource.name)) {
            errors.push('Resource name must be PascalCase (e.g., Category, BlogPost)');
        }
        if (!resource.displayName || typeof resource.displayName !== 'string') {
            errors.push('Display name is required and must be a string');
        }
        // Version format
        if (resource.version && !/^\d+\.\d+\.\d+$/.test(resource.version)) {
            errors.push('Version must be in semver format (e.g., 1.0.0)');
        }
        // Status
        if (resource.status && !['draft', 'published', 'deprecated'].includes(resource.status)) {
            errors.push('Status must be one of: draft, published, deprecated');
        }
        // Fields
        if (!resource.fields || !Array.isArray(resource.fields)) {
            errors.push('Fields must be an array');
        }
        else if (resource.fields.length === 0) {
            errors.push('At least one field is required');
        }
        else {
            const fieldNames = new Set();
            for (const field of resource.fields) {
                const fieldResult = this.validateField(field);
                if (!fieldResult.valid) {
                    errors.push(...fieldResult.errors);
                }
                // Check for duplicate field names
                if (fieldNames.has(field.name)) {
                    errors.push(`Duplicate field name: "${field.name}"`);
                }
                fieldNames.add(field.name);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Validate a single field.
     */
    validateField(field) {
        const errors = [];
        if (!field.name || typeof field.name !== 'string') {
            errors.push('Field name is required and must be a string');
        }
        else if (!/^[a-z][a-z0-9_]*$/.test(field.name)) {
            errors.push(`Field name "${field.name}" must be snake_case (lowercase letters, numbers, underscores)`);
        }
        if (!field.displayName || typeof field.displayName !== 'string') {
            errors.push(`Field "${field.name}" must have a displayName`);
        }
        if (!field.type || !VALID_FIELD_TYPES.includes(field.type)) {
            errors.push(`Field "${field.name}" has invalid type "${field.type}". Valid types: ${VALID_FIELD_TYPES.join(', ')}`);
        }
        // Type-specific validation
        const constraintResult = this.validateFieldConstraints(field);
        if (!constraintResult.valid) {
            errors.push(...constraintResult.errors);
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Validate field constraints for a given type.
     */
    validateFieldConstraints(field) {
        const errors = [];
        // Enum must have values
        if (field.type === 'enum') {
            if (!field.enum || !Array.isArray(field.enum) || field.enum.length === 0) {
                errors.push(`Enum field "${field.name}" must have at least one enum value`);
            }
        }
        // Relation must have target
        if (field.type === 'relation') {
            if (!field.relationResource || typeof field.relationResource !== 'string') {
                errors.push(`Relation field "${field.name}" must have a relationResource`);
            }
            if (field.relationType &&
                !['one-to-one', 'one-to-many', 'many-to-many'].includes(field.relationType)) {
                errors.push(`Relation field "${field.name}" has invalid relationType "${field.relationType}"`);
            }
        }
        // String/text constraints
        if (field.type === 'string' || field.type === 'text') {
            if (field.minLength !== undefined && field.maxLength !== undefined) {
                if (field.minLength > field.maxLength) {
                    errors.push(`Field "${field.name}": minLength (${field.minLength}) must be <= maxLength (${field.maxLength})`);
                }
            }
        }
        // Numeric constraints
        if (field.type === 'integer' || field.type === 'float') {
            if (field.minimum !== undefined && field.maximum !== undefined) {
                if (field.minimum > field.maximum) {
                    errors.push(`Field "${field.name}": minimum (${field.minimum}) must be <= maximum (${field.maximum})`);
                }
            }
        }
        return { valid: errors.length === 0, errors };
    }
    /**
     * Validate a version string is valid semver.
     */
    isValidVersion(version) {
        return /^\d+\.\d+\.\d+$/.test(version);
    }
    /**
     * Increment a version string based on the type of change.
     */
    incrementVersion(currentVersion, type) {
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        switch (type) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
                return `${major}.${minor}.${patch + 1}`;
        }
    }
    /**
     * Convert a PascalCase name to snake_case table name.
     */
    toTableName(name) {
        return name
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_/, '');
    }
}
//# sourceMappingURL=resource-validator.js.map