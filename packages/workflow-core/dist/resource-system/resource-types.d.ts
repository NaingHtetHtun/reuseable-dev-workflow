/** Resource field types */
export type FieldType =
  'string' | 'text' | 'boolean' | 'integer' | 'float' | 'timestamp' | 'json' | 'enum' | 'relation';
/** A field in a resource definition */
export interface ResourceField {
  /** Field name (snake_case) */
  name: string;
  /** Display name */
  displayName: string;
  /** Field type */
  type: FieldType;
  /** Whether the field is required */
  required: boolean;
  /** Whether the field is unique */
  unique?: boolean;
  /** Default value */
  default?: unknown;
  /** Description */
  description?: string;
  /** For string/text: min length */
  minLength?: number;
  /** For string/text: max length */
  maxLength?: number;
  /** For integer/float: minimum value */
  minimum?: number;
  /** For integer/float: maximum value */
  maximum?: number;
  /** For string: regex pattern */
  pattern?: string;
  /** For enum: allowed values */
  enum?: string[];
  /** For relation: target resource name */
  relationResource?: string;
  /** For relation: relation type */
  relationType?: 'one-to-one' | 'one-to-many' | 'many-to-many';
}
/** A resource definition */
export interface ResourceDefinition {
  /** Unique identifier (auto-generated) */
  id: string;
  /** Resource name (PascalCase, unique within project) */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Description */
  description?: string;
  /** Version (semver) */
  version: string;
  /** Status */
  status: ResourceStatus;
  /** Project ID */
  projectId: string;
  /** Table name override (default: snake_case of name) */
  tableName?: string;
  /** Fields */
  fields: ResourceField[];
  /** Metadata */
  metadata: ResourceMetadata;
}
/** Resource status */
export type ResourceStatus = 'draft' | 'published' | 'deprecated';
/** Resource metadata */
export interface ResourceMetadata {
  createdAt: Date;
  updatedAt: Date;
  versionCount: number;
}
/** A version snapshot of a resource */
export interface ResourceVersion {
  id: string;
  resourceId: string;
  version: string;
  definition: Omit<ResourceDefinition, 'id' | 'metadata'>;
  changelog?: string;
  createdAt: Date;
}
/** Input for creating a resource */
export interface CreateResourceInput {
  name: string;
  displayName: string;
  description?: string;
  tableName?: string;
  fields: ResourceField[];
}
/** Input for updating a resource */
export interface UpdateResourceInput {
  displayName?: string;
  description?: string;
  tableName?: string;
  fields?: ResourceField[];
  status?: ResourceStatus;
}
/** Query parameters for listing resources */
export interface ResourceQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ResourceStatus;
}
/** Paginated resource list result */
export interface ResourceListResult {
  data: ResourceDefinition[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
/** Validation result */
export interface ResourceValidationResult {
  valid: boolean;
  errors: string[];
}
//# sourceMappingURL=resource-types.d.ts.map
