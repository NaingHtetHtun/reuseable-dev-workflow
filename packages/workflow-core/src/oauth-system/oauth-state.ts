import * as crypto from 'crypto';

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

/** Serialized state token format: base64url(data).hmac-signature */
const STATE_SEPARATOR = '.';

/**
 * OAuth state manager for CSRF protection.
 *
 * Generates and validates state tokens using HMAC-SHA256.
 * State tokens are single-use and expire after a configurable duration.
 */
export class OAuthStateManager {
  private readonly secret: Buffer;
  private readonly maxAgeMs: number;

  constructor(secret: string, maxAgeMs = 10 * 60 * 1000) {
    // Use the secret directly as a key (at least 32 bytes recommended)
    this.secret = Buffer.from(secret, 'hex');
    this.maxAgeMs = maxAgeMs;
  }

  /**
   * Generate a new state token with metadata.
   * Signs the state to prevent tampering.
   */
  generateState(data: Omit<OAuthStateData, 'createdAt'>): string {
    const stateData: OAuthStateData = {
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
  validateState(state: string): OAuthStateData | null {
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
      const data = JSON.parse(payload) as OAuthStateData;

      // Check expiry
      if (this.isExpired(data)) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  /**
   * Check if a state token has expired.
   */
  isExpired(stateData: OAuthStateData): boolean {
    return Date.now() - stateData.createdAt > this.maxAgeMs;
  }

  /**
   * Sign a payload using HMAC-SHA256.
   */
  private sign(payload: string): string {
    return crypto.createHmac('sha256', this.secret).update(payload).digest('base64url');
  }

  /**
   * Constant-time string comparison to prevent timing attacks.
   */
  private safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
