/**
 * iQ-auth Plugin Loader
 * 
 * Manages dynamic loading and lifecycle of authentication plugins
 */

import { IPlugin, IAuthPlugin } from '../types';

export class PluginLoader {
  private plugins: Map<string, IPlugin> = new Map();

  /**
   * Register a plugin
   */
  async register(plugin: IPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Initialize a plugin
   */
  async initialize(
    pluginName: string,
    config: Record<string, unknown>
  ): Promise<void> {
    const plugin = this.plugins.get(pluginName);

    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    await plugin.initialize(config);
  }

  /**
   * Get a plugin by name
   */
  get(pluginName: string): IPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * Get all registered plugins
   */
  getAll(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all auth plugins
   */
  getAuthPlugins(): IAuthPlugin[] {
    return this.getAll().filter(
      (plugin): plugin is IAuthPlugin => 'provider' in plugin
    );
  }

  /**
   * Unregister and destroy a plugin
   */
  async unregister(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);

    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found`);
    }

    await plugin.destroy();
    this.plugins.delete(pluginName);
  }

  /**
   * Destroy all plugins
   */
  async destroyAll(): Promise<void> {
    const plugins = Array.from(this.plugins.values());

    for (const plugin of plugins) {
      await plugin.destroy();
    }

    this.plugins.clear();
  }
}
