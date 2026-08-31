/** Component status lifecycle */
export type ComponentStatus = 'draft' | 'published' | 'deprecated';
/** A reusable development component definition */
export interface ComponentDefinition {
    /** Unique identifier (auto-generated) */
    id: string;
    /** Component name (unique within project) */
    name: string;
    /** Human-readable display name */
    displayName: string;
    /** Detailed description of what the component does */
    description: string;
    /** Component version (semver) */
    version: string;
    /** Component status */
    status: ComponentStatus;
    /** Category for grouping (e.g., 'auth', 'crud', 'email', 'notification') */
    category: string;
    /** Tags for search and filtering */
    tags: string[];
    /** Author name or identifier */
    author: string;
    /** Project ID this component belongs to */
    projectId: string;
    /** Configuration schema — what users can customize */
    configSchema: ComponentConfigSchema;
    /** Credential schema — what credentials the component needs */
    credentialSchema: ComponentCredentialSchema;
    /** Input schema — what data the component accepts */
    inputSchema: ComponentIoSchema;
    /** Output schema — what data the component produces */
    outputSchema: ComponentIoSchema;
    /** The actual component implementation (JSON) */
    implementation: ComponentImplementation;
    /** Metadata */
    metadata: ComponentMetadata;
}
/** Configuration schema for user-configurable options */
export interface ComponentConfigSchema {
    type: 'object';
    properties: Record<string, ComponentConfigProperty>;
    required?: string[];
}
export interface ComponentConfigProperty {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    displayName: string;
    description?: string;
    default?: unknown;
    enum?: unknown[];
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
}
/** Credential schema — what external services the component needs */
export interface ComponentCredentialSchema {
    /** Required credential types */
    required: Array<{
        type: string;
        displayName: string;
        description: string;
        optional?: boolean;
    }>;
}
/** Input/Output schema declaration */
export interface ComponentIoSchema {
    type: 'object';
    properties: Record<string, {
        type: string;
        displayName: string;
        description?: string;
    }>;
}
/** The actual component implementation */
export interface ComponentImplementation {
    /** Implementation type */
    type: 'workflow' | 'node' | 'function';
    /** For workflow type: the workflow definition */
    workflow?: Record<string, unknown>;
    /** For node type: the node type and parameters */
    node?: {
        type: string;
        parameters: Record<string, unknown>;
    };
    /** For function type: the function definition */
    function?: {
        code: string;
        runtime: string;
    };
}
/** Component metadata */
export interface ComponentMetadata {
    /** When the component was first created */
    createdAt: Date;
    /** When the component was last updated */
    updatedAt: Date;
    /** Total number of versions */
    versionCount: number;
    /** Number of projects using this component (future) */
    usageCount: number;
    /** License identifier */
    license?: string;
    /** Repository URL */
    repository?: string;
    /** Documentation URL */
    documentation?: string;
}
/** A version snapshot of a component */
export interface ComponentVersion {
    id: string;
    componentId: string;
    version: string;
    /** Snapshot of the component definition at this version */
    definition: Omit<ComponentDefinition, 'id' | 'metadata'>;
    /** Changelog for this version */
    changelog?: string;
    createdAt: Date;
}
/** Input for creating a component */
export interface CreateComponentInput {
    name: string;
    displayName: string;
    description?: string;
    category?: string;
    tags?: string[];
    author?: string;
    configSchema?: ComponentConfigSchema;
    credentialSchema?: ComponentCredentialSchema;
    inputSchema?: ComponentIoSchema;
    outputSchema?: ComponentIoSchema;
    implementation?: ComponentImplementation;
}
/** Input for updating a component */
export interface UpdateComponentInput {
    displayName?: string;
    description?: string;
    status?: ComponentStatus;
    category?: string;
    tags?: string[];
    author?: string;
    configSchema?: ComponentConfigSchema;
    credentialSchema?: ComponentCredentialSchema;
    inputSchema?: ComponentIoSchema;
    outputSchema?: ComponentIoSchema;
    implementation?: ComponentImplementation;
}
/** Query parameters for listing components */
export interface ComponentQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: ComponentStatus;
    tags?: string[];
}
/** Paginated component list result */
export interface ComponentListResult {
    data: ComponentDefinition[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
/** Validation result */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
//# sourceMappingURL=component-types.d.ts.map