/**
 * Framework-independent credential type definitions.
 *
 * Each credential type defines what secret fields and metadata fields
 * are expected for a given integration (e.g., Google OAuth2, GitHub token, SMTP).
 */
/** A field within a credential definition */
export interface CredentialField {
  /** Internal field name (e.g., 'accessToken', 'apiKey') */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Field data type */
  type: 'string' | 'number' | 'boolean';
  /** Whether this field is required */
  required: boolean;
  /** Description of the field */
  description?: string;
  /** Default value if not provided */
  defaultValue?: unknown;
}
/** Defines what a credential type expects */
export interface CredentialTypeDefinition {
  /** Unique type identifier (e.g., 'google-oauth2', 'api-key') */
  type: string;
  /** Human-readable display name */
  displayName: string;
  /** Description of this credential type */
  description: string;
  /** Category for grouping (e.g., 'auth', 'api', 'email') */
  category: string;
  /**
   * Fields stored as secrets (encrypted at rest).
   * These are NEVER returned in API responses.
   */
  secretFields: CredentialField[];
  /**
   * Fields stored as metadata (not encrypted).
   * These ARE returned in API responses and are queryable.
   */
  metadataFields: CredentialField[];
}
/** Validation result */
export interface CredentialValidationResult {
  valid: boolean;
  errors: string[];
}
/**
 * Validate credential data against a credential type definition.
 */
export declare function validateCredentialData(
  definition: CredentialTypeDefinition,
  data: Record<string, unknown>,
): CredentialValidationResult;
export declare const apiKeyCredentialType: CredentialTypeDefinition;
export declare const bearerTokenCredentialType: CredentialTypeDefinition;
export declare const basicAuthCredentialType: CredentialTypeDefinition;
export declare const googleOAuth2CredentialType: CredentialTypeDefinition;
export declare const githubTokenCredentialType: CredentialTypeDefinition;
export declare const smtpCredentialType: CredentialTypeDefinition;
/** All built-in credential types */
export declare const builtInCredentialTypes: CredentialTypeDefinition[];
//# sourceMappingURL=credential-types.d.ts.map
