/**
 * iQ-auth Core Entry Point
 */
export * from './constants';
export * from './types';
export * from './types/platform';
export { InMemoryStorage } from './storage/in-memory';
export { IdentityRegistry } from './registry/identity-registry';
export { PluginLoader } from './plugin-loader';
export { EmailPasswordProvider } from './providers/email-password';
export type { EmailPasswordCredentials, EmailPasswordConfig, } from './providers/email-password';
export { detectPlatform, detectCapabilities, recommendAuthMethods, } from './utils/device-detection';
export type { Platform, BiometricType, SecurityLevel, DeviceCapabilities, } from './utils/device-detection';
/**
 * Main iQ-auth Engine class
 */
import { CoreConfig, IAuthProvider } from './types';
import { PluginLoader } from './plugin-loader';
import { IdentityRegistry } from './registry/identity-registry';
export declare class IQAuth {
    private pluginLoader;
    private identityRegistry;
    private storage;
    constructor(config?: CoreConfig);
    /**
     * Get the plugin loader
     */
    get plugins(): PluginLoader;
    /**
     * Get the identity registry
     */
    get registry(): IdentityRegistry;
    /**
     * Get an auth provider by name
     */
    getAuthProvider(name: string): IAuthProvider | undefined;
    /**
     * Register multiple plugins
     */
    private registerPlugins;
    /**
     * Cleanup and destroy all plugins
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map