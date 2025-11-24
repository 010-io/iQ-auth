/**
 * iQ-auth Core Entry Point
 */

// Constants
export * from './constants';

// Types
export * from './types';
export * from './types/platform';

// Storage
export { InMemoryStorage } from './storage/in-memory';

// Registry
export { IdentityRegistry } from './registry/identity-registry';

// Plugin Loader
export { PluginLoader } from './plugin-loader';

// Providers
export { EmailPasswordProvider } from './providers/email-password';
export type {
  EmailPasswordCredentials,
  EmailPasswordConfig,
} from './providers/email-password';

// Utilities
export {
  detectPlatform,
  detectCapabilities,
  recommendAuthMethods,
} from './utils/device-detection';
export type {
  Platform,
  BiometricType,
  SecurityLevel,
  DeviceCapabilities,
} from './utils/device-detection';

/**
 * Main iQ-auth Engine class
 */
import { CoreConfig, IStorageAdapter, IAuthProvider } from './types';
import { PluginLoader } from './plugin-loader';
import { IdentityRegistry } from './registry/identity-registry';
import { InMemoryStorage } from './storage/in-memory';

export class IQAuth {
  private pluginLoader: PluginLoader;
  private identityRegistry: IdentityRegistry;
  private storage: IStorageAdapter;

  constructor(config: CoreConfig = {}) {
    this.storage = config.storage || new InMemoryStorage();
    this.pluginLoader = new PluginLoader();
    this.identityRegistry = new IdentityRegistry(this.storage);

    // Register plugins if provided
    if (config.plugins) {
      void this.registerPlugins(config.plugins);
    }
  }

  /**
   * Get the plugin loader
   */
  get plugins(): PluginLoader {
    return this.pluginLoader;
  }

  /**
   * Get the identity registry
   */
  get registry(): IdentityRegistry {
    return this.identityRegistry;
  }

  /**
   * Get an auth provider by name
   */
  getAuthProvider(name: string): IAuthProvider | undefined {
    const plugin = this.pluginLoader.get(name);
    if (plugin && 'provider' in plugin) {
      return (plugin as { provider: IAuthProvider }).provider;
    }
    return undefined;
  }

  /**
   * Register multiple plugins
   */
  private async registerPlugins(
    plugins: CoreConfig['plugins']
  ): Promise<void> {
    if (!plugins) return;

    for (const plugin of plugins) {
      await this.pluginLoader.register(plugin);
    }
  }

  /**
   * Cleanup and destroy all plugins
   */
  async destroy(): Promise<void> {
    await this.pluginLoader.destroyAll();
  }
}
