/** Data embedded in the state token */
export interface OAuthStateData {
    /** Provider type */
    providerType: string;
    /** Project ID */
    projectId: string;
    /** Credential ID being authorized (if updating existing) */
    credentialId?: string;
    /** Optional return URL after authorization */
    returnUrl?: string;
    /** Timestamp */
    createdAt: number;
}
/**
 * OAuth state manager for CSRF protection.
 *
 * Generates and validates state tokens using HMAC-SHA256.
 * State tokens are single-use and expire after a configurable duration.
 */
export declare class OAuthStateManager {
    private readonly secret;
    private readonly maxAgeMs;
    constructor(secret: string, maxAgeMs?: number);
    /**
     * Generate a new state token with metadata.
     * Signs the state to prevent tampering.
     */
    generateState(data: Omit<OAuthStateData, 'createdAt'>): string;
    /**
     * Validate and decode a state token.
     * Returns null if invalid or expired.
     */
    validateState(state: string): OAuthStateData | null;
    /**
     * Check if a state token has expired.
     */
    isExpired(stateData: OAuthStateData): boolean;
    /**
     * Sign a payload using HMAC-SHA256.
     */
    private sign;
    /**
     * Constant-time string comparison to prevent timing attacks.
     */
    private safeEqual;
}
//# sourceMappingURL=oauth-state.d.ts.map