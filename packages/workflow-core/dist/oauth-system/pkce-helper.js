import * as crypto from 'crypto';
/**
 * PKCE helper for generating code verifiers and challenges.
 * Implements RFC 7636.
 */
export class PkceHelper {
  /**
   * Generate a PKCE code verifier.
   * Returns a cryptographically random string (43-128 characters).
   */
  static generateCodeVerifier(length = 64) {
    const buffer = crypto.randomBytes(length);
    return buffer.toString('base64url').substring(0, length);
  }
  /**
   * Generate a PKCE code challenge from a code verifier.
   * Supports S256 (SHA-256) and plain methods.
   */
  static generateCodeChallenge(codeVerifier, method = 'S256') {
    if (method === 'plain') {
      return codeVerifier;
    }
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  }
  /**
   * Generate a complete PKCE challenge pair.
   */
  static generate() {
    const codeVerifier = PkceHelper.generateCodeVerifier();
    const codeChallenge = PkceHelper.generateCodeChallenge(codeVerifier, 'S256');
    return {
      codeVerifier,
      codeChallenge,
      method: 'S256',
    };
  }
}
//# sourceMappingURL=pkce-helper.js.map
