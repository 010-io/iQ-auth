"use strict";
/**
 * iQ-auth Core Entry Point
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQAuth = exports.recommendAuthMethods = exports.detectCapabilities = exports.detectPlatform = exports.EmailPasswordProvider = exports.PluginLoader = exports.IdentityRegistry = exports.InMemoryStorage = void 0;
// Constants
__exportStar(require("./constants"), exports);
// Types
__exportStar(require("./types"), exports);
__exportStar(require("./types/platform"), exports);
// Storage
var in_memory_1 = require("./storage/in-memory");
Object.defineProperty(exports, "InMemoryStorage", { enumerable: true, get: function () { return in_memory_1.InMemoryStorage; } });
// Registry
var identity_registry_1 = require("./registry/identity-registry");
Object.defineProperty(exports, "IdentityRegistry", { enumerable: true, get: function () { return identity_registry_1.IdentityRegistry; } });
// Plugin Loader
var plugin_loader_1 = require("./plugin-loader");
Object.defineProperty(exports, "PluginLoader", { enumerable: true, get: function () { return plugin_loader_1.PluginLoader; } });
// Providers
var email_password_1 = require("./providers/email-password");
Object.defineProperty(exports, "EmailPasswordProvider", { enumerable: true, get: function () { return email_password_1.EmailPasswordProvider; } });
// Utilities
var device_detection_1 = require("./utils/device-detection");
Object.defineProperty(exports, "detectPlatform", { enumerable: true, get: function () { return device_detection_1.detectPlatform; } });
Object.defineProperty(exports, "detectCapabilities", { enumerable: true, get: function () { return device_detection_1.detectCapabilities; } });
Object.defineProperty(exports, "recommendAuthMethods", { enumerable: true, get: function () { return device_detection_1.recommendAuthMethods; } });
const plugin_loader_2 = require("./plugin-loader");
const identity_registry_2 = require("./registry/identity-registry");
const in_memory_2 = require("./storage/in-memory");
class IQAuth {
    pluginLoader;
    identityRegistry;
    storage;
    constructor(config = {}) {
        this.storage = config.storage || new in_memory_2.InMemoryStorage();
        this.pluginLoader = new plugin_loader_2.PluginLoader();
        this.identityRegistry = new identity_registry_2.IdentityRegistry(this.storage);
        // Register plugins if provided
        if (config.plugins) {
            void this.registerPlugins(config.plugins);
        }
    }
    /**
     * Get the plugin loader
     */
    get plugins() {
        return this.pluginLoader;
    }
    /**
     * Get the identity registry
     */
    get registry() {
        return this.identityRegistry;
    }
    /**
     * Get an auth provider by name
     */
    getAuthProvider(name) {
        const plugin = this.pluginLoader.get(name);
        if (plugin && 'provider' in plugin) {
            return plugin.provider;
        }
        return undefined;
    }
    /**
     * Register multiple plugins
     */
    async registerPlugins(plugins) {
        if (!plugins)
            return;
        for (const plugin of plugins) {
            await this.pluginLoader.register(plugin);
        }
    }
    /**
     * Cleanup and destroy all plugins
     */
    async destroy() {
        await this.pluginLoader.destroyAll();
    }
}
exports.IQAuth = IQAuth;
//# sourceMappingURL=index.js.map