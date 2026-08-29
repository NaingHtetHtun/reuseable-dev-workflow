/**
 * Framework-independent credential type definitions.
 *
 * Each credential type defines what secret fields and metadata fields
 * are expected for a given integration (e.g., Google OAuth2, GitHub token, SMTP).
 */
/**
 * Validate credential data against a credential type definition.
 */
export function validateCredentialData(definition, data) {
    const errors = [];
    // Check required secret fields
    for (const field of definition.secretFields) {
        if (field.required && !(field.name in data)) {
            errors.push(`Missing required secret field: ${field.displayName}`);
        }
    }
    // Validate field types
    for (const [key, value] of Object.entries(data)) {
        const field = definition.secretFields.find((f) => f.name === key);
        if (field && value !== undefined && value !== null) {
            if (!matchesType(value, field.type)) {
                errors.push(`Field "${field.displayName}" expected type "${field.type}" but got "${typeof value}"`);
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
        default:
            return true;
    }
}
// ─── Built-in Credential Types ───────────────────────────────────────────────
export const apiKeyCredentialType = {
    type: 'api-key',
    displayName: 'API Key',
    description: 'Generic API key authentication',
    category: 'api',
    secretFields: [
        {
            name: 'apiKey',
            displayName: 'API Key',
            type: 'string',
            required: true,
            description: 'The API key',
        },
    ],
    metadataFields: [
        {
            name: 'headerName',
            displayName: 'Header Name',
            type: 'string',
            required: false,
            description: 'HTTP header name (default: Authorization)',
            defaultValue: 'Authorization',
        },
    ],
};
export const bearerTokenCredentialType = {
    type: 'bearer-token',
    displayName: 'Bearer Token',
    description: 'Bearer token authentication',
    category: 'auth',
    secretFields: [
        {
            name: 'token',
            displayName: 'Token',
            type: 'string',
            required: true,
            description: 'The bearer token',
        },
    ],
    metadataFields: [],
};
export const basicAuthCredentialType = {
    type: 'basic-auth',
    displayName: 'Basic Authentication',
    description: 'HTTP Basic authentication (username/password)',
    category: 'auth',
    secretFields: [
        {
            name: 'username',
            displayName: 'Username',
            type: 'string',
            required: true,
            description: 'The username',
        },
        {
            name: 'password',
            displayName: 'Password',
            type: 'string',
            required: true,
            description: 'The password',
        },
    ],
    metadataFields: [],
};
export const googleOAuth2CredentialType = {
    type: 'google-oauth2',
    displayName: 'Google OAuth2',
    description: 'Google OAuth2 authentication (client credentials + tokens)',
    category: 'auth',
    secretFields: [
        {
            name: 'clientId',
            displayName: 'Client ID',
            type: 'string',
            required: true,
            description: 'Google OAuth2 client ID',
        },
        {
            name: 'clientSecret',
            displayName: 'Client Secret',
            type: 'string',
            required: true,
            description: 'Google OAuth2 client secret',
        },
        {
            name: 'accessToken',
            displayName: 'Access Token',
            type: 'string',
            required: false,
            description: 'Current access token (obtained via OAuth2 flow)',
        },
        {
            name: 'refreshToken',
            displayName: 'Refresh Token',
            type: 'string',
            required: false,
            description: 'Refresh token for obtaining new access tokens',
        },
    ],
    metadataFields: [
        {
            name: 'expiresAt',
            displayName: 'Token Expiry',
            type: 'string',
            required: false,
            description: 'ISO timestamp when the access token expires',
        },
        {
            name: 'scopes',
            displayName: 'Scopes',
            type: 'string',
            required: false,
            description: 'Space-separated list of granted scopes',
        },
    ],
};
export const githubTokenCredentialType = {
    type: 'github-token',
    displayName: 'GitHub Token',
    description: 'GitHub personal access token or app token',
    category: 'api',
    secretFields: [
        {
            name: 'token',
            displayName: 'Token',
            type: 'string',
            required: true,
            description: 'GitHub personal access token',
        },
    ],
    metadataFields: [
        {
            name: 'scopes',
            displayName: 'Scopes',
            type: 'string',
            required: false,
            description: 'Comma-separated list of granted scopes',
        },
    ],
};
export const smtpCredentialType = {
    type: 'smtp',
    displayName: 'SMTP Email',
    description: 'SMTP email server credentials',
    category: 'email',
    secretFields: [
        {
            name: 'host',
            displayName: 'SMTP Host',
            type: 'string',
            required: true,
            description: 'SMTP server hostname',
        },
        {
            name: 'port',
            displayName: 'SMTP Port',
            type: 'number',
            required: true,
            description: 'SMTP server port',
        },
        {
            name: 'username',
            displayName: 'Username',
            type: 'string',
            required: true,
            description: 'SMTP username',
        },
        {
            name: 'password',
            displayName: 'Password',
            type: 'string',
            required: true,
            description: 'SMTP password',
        },
        {
            name: 'fromEmail',
            displayName: 'From Email',
            type: 'string',
            required: true,
            description: 'Default sender email address',
        },
    ],
    metadataFields: [
        {
            name: 'secure',
            displayName: 'Use TLS',
            type: 'boolean',
            required: false,
            description: 'Whether to use TLS (default: true)',
            defaultValue: true,
        },
    ],
};
/** All built-in credential types */
export const builtInCredentialTypes = [
    apiKeyCredentialType,
    bearerTokenCredentialType,
    basicAuthCredentialType,
    googleOAuth2CredentialType,
    githubTokenCredentialType,
    smtpCredentialType,
];
//# sourceMappingURL=credential-types.js.map