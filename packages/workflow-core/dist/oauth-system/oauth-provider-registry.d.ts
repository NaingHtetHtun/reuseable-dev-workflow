import { OAuthProvider, OAuthProviderMetadata } from './oauth-provider.interface';
/**
 * Registry of OAuth providers.
 *
 * Framework-independent — can be used by the API, code generator, and visual builder.
 */
export declare class OAuthProviderRegistry {
  private readonly providers;
  /**
   * Register an OAuth provider.
   */
  register(provider: OAuthProvider): void;
  /**
   * Get an OAuth provider by type.
   */
  get(type: string): OAuthProvider | undefined;
  /**
   * Check if an OAuth provider is registered.
   */
  hasType(type: string): boolean;
  /**
   * Get all registered OAuth providers.
   */
  getAll(): OAuthProvider[];
  /**
   * Get metadata for a registered provider.
   */
  getMetadata(type: string): OAuthProviderMetadata | undefined;
  /**
   * Get all provider metadata.
   */
  getAllMetadata(): OAuthProviderMetadata[];
}
//# sourceMappingURL=oauth-provider-registry.d.ts.map
