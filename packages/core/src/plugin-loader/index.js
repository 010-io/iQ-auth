"use strict";
/**
 * iQ-auth Plugin Loader
 *
 * Manages dynamic loading and lifecycle of authentication plugins
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = void 0;
class PluginLoader {
    plugins = new Map();
    /**
     * Register a plugin
     */
    async register(plugin) {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin "${plugin.name}" is already registered`);
        }
        this.plugins.set(plugin.name, plugin);
    }
    /**
     * Initialize a plugin
     */
    async initialize(pluginName, config) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin "${pluginName}" not found`);
        }
        await plugin.initialize(config);
    }
    /**
     * Get a plugin by name
     */
    get(pluginName) {
        return this.plugins.get(pluginName);
    }
    /**
     * Get all registered plugins
     */
    getAll() {
        return Array.from(this.plugins.values());
    }
    /**
     * Get all auth plugins
     */
    getAuthPlugins() {
        return this.getAll().filter((plugin) => 'provider' in plugin);
    }
    /**
     * Unregister and destroy a plugin
     */
    async unregister(pluginName) {
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
    async destroyAll() {
        const plugins = Array.from(this.plugins.values());
        for (const plugin of plugins) {
            await plugin.destroy();
        }
        this.plugins.clear();
    }
}
exports.PluginLoader = PluginLoader;
//# sourceMappingURL=index.js.map