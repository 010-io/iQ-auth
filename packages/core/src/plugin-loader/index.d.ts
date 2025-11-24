/**
 * iQ-auth Plugin Loader
 *
 * Manages dynamic loading and lifecycle of authentication plugins
 */
import { IPlugin, IAuthPlugin } from '../types';
export declare class PluginLoader {
    private plugins;
    /**
     * Register a plugin
     */
    register(plugin: IPlugin): Promise<void>;
    /**
     * Initialize a plugin
     */
    initialize(pluginName: string, config: Record<string, unknown>): Promise<void>;
    /**
     * Get a plugin by name
     */
    get(pluginName: string): IPlugin | undefined;
    /**
     * Get all registered plugins
     */
    getAll(): IPlugin[];
    /**
     * Get all auth plugins
     */
    getAuthPlugins(): IAuthPlugin[];
    /**
     * Unregister and destroy a plugin
     */
    unregister(pluginName: string): Promise<void>;
    /**
     * Destroy all plugins
     */
    destroyAll(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map