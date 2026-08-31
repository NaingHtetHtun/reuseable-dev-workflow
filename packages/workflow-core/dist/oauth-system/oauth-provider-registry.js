/**
 * Registry of OAuth providers.
 *
 * Framework-independent — can be used by the API, code generator, and visual builder.
 */
export class OAuthProviderRegistry {
  providers = new Map();
  /**
   * Register an OAuth provider.
   */
  register(provider) {
    if (this.providers.has(provider.metadata.type)) {
      throw new Error(`OAuth provider already registered: ${provider.metadata.type}`);
    }
    this.providers.set(provider.metadata.type, provider);
  }
  /**
   * Get an OAuth provider by type.
   */
  get(type) {
    return this.providers.get(type);
  }
  /**
   * Check if an OAuth provider is registered.
   */
  hasType(type) {
    return this.providers.has(type);
  }
  /**
   * Get all registered OAuth providers.
   */
  getAll() {
    return Array.from(this.providers.values());
  }
  /**
   * Get metadata for a registered provider.
   */
  getMetadata(type) {
    return this.providers.get(type)?.metadata;
  }
  /**
   * Get all provider metadata.
   */
  getAllMetadata() {
    return this.getAll().map((p) => p.metadata);
  }
}
//# sourceMappingURL=oauth-provider-registry.js.map
