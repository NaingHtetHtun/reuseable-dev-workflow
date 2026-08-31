export interface PkceChallenge {
  codeVerifier: string;
  codeChallenge: string;
  method: 'S256' | 'plain';
}
/**
 * PKCE helper for generating code verifiers and challenges.
 * Implements RFC 7636.
 */
export declare class PkceHelper {
  /**
   * Generate a PKCE code verifier.
   * Returns a cryptographically random string (43-128 characters).
   */
  static generateCodeVerifier(length?: number): string;
  /**
   * Generate a PKCE code challenge from a code verifier.
   * Supports S256 (SHA-256) and plain methods.
   */
  static generateCodeChallenge(codeVerifier: string, method?: 'S256' | 'plain'): string;
  /**
   * Generate a complete PKCE challenge pair.
   */
  static generate(): PkceChallenge;
}
//# sourceMappingURL=pkce-helper.d.ts.map
