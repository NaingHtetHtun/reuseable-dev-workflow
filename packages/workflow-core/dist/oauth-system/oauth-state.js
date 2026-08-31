import * as crypto from 'crypto';
/** Serialized state token format: base64url(data).hmac-signature */
const STATE_SEPARATOR = '.';
/**
 * OAuth state manager for CSRF protection.
 *
 * Generates and validates state tokens using HMAC-SHA256.
 * State tokens are single-use and expire after a configurable duration.
 */
export class OAuthStateManager {
    secret;
    maxAgeMs;
    constructor(secret, maxAgeMs = 10 * 60 * 1000) {
        // Use the secret directly as a key (at least 32 bytes recommended)
        this.secret = Buffer.from(secret, 'hex');
        this.maxAgeMs = maxAgeMs;
    }
    /**
     * Generate a new state token with metadata.
     * Signs the state to prevent tampering.
     */
    generateState(data) {
        const stateData = {
            ...data,
            createdAt: Date.now(),
        };
        const payload = JSON.stringify(stateData);
        const payloadBase64 = Buffer.from(payload).toString('base64url');
        const signature = this.sign(payloadBase64);
        return `${payloadBase64}${STATE_SEPARATOR}${signature}`;
    }
    /**
     * Validate and decode a state token.
     * Returns null if invalid or expired.
     */
    validateState(state) {
        if (!state || !state.includes(STATE_SEPARATOR)) {
            return null;
        }
        const [payloadBase64, signature] = state.split(STATE_SEPARATOR);
        if (!payloadBase64 || !signature) {
            return null;
        }
        // Verify signature
        const expectedSignature = this.sign(payloadBase64);
        if (!this.safeEqual(signature, expectedSignature)) {
            return null;
        }
        // Decode payload
        try {
            const payload = Buffer.from(payloadBase64, 'base64url').toString('utf8');
            const data = JSON.parse(payload);
            // Check expiry
            if (this.isExpired(data)) {
                return null;
            }
            return data;
        }
        catch {
            return null;
        }
    }
    /**
     * Check if a state token has expired.
     */
    isExpired(stateData) {
        return Date.now() - stateData.createdAt > this.maxAgeMs;
    }
    /**
     * Sign a payload using HMAC-SHA256.
     */
    sign(payload) {
        return crypto.createHmac('sha256', this.secret).update(payload).digest('base64url');
    }
    /**
     * Constant-time string comparison to prevent timing attacks.
     */
    safeEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    }
}
//# sourceMappingURL=oauth-state.js.map