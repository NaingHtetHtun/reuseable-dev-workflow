import { OAuthProvider, OAuthProviderMetadata } from './oauth-provider.interface';

/**
 * Registry of OAuth providers.
 *
 * Framework-independent — can be used by the API, code generator, and visual builder.
 */
export class OAuthProviderRegistry {
  private readonly providers = new Map<string, OAuthProvider>();

  /**
   * Register an OAuth provider.
   */
  register(provider: OAuthProvider): void {
    if (this.providers.has(provider.metadata.type)) {
      throw new Error(`OAuth provider already registered: ${provider.metadata.type}`);
    }
    this.providers.set(provider.metadata.type, provider);
  }

  /**
   * Get an OAuth provider by type.
   */
  get(type: string): OAuthProvider | undefined {
    return this.providers.get(type);
  }

  /**
   * Check if an OAuth provider is registered.
   */
  hasType(type: string): boolean {
    return this.providers.has(type);
  }

  /**
   * Get all registered OAuth providers.
   */
  getAll(): OAuthProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get metadata for a registered provider.
   */
  getMetadata(type: string): OAuthProviderMetadata | undefined {
    return this.providers.get(type)?.metadata;
  }

  /**
   * Get all provider metadata.
   */
  getAllMetadata(): OAuthProviderMetadata[] {
    return this.getAll().map((p) => p.metadata);
  }
}
