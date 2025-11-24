"use strict";
/**
 * iQ-auth Core Constants
 *
 * CREATOR_SEED: Unique identifier for the project creator
 * VERSION_SEED: Auto-generated version identifier based on cryptographic chain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDENTITY_TYPES = exports.AUTH_METHODS = exports.SYSTEM_VERSION = exports.SYSTEM_NAME = exports.VERSION_SEED = exports.CREATOR_SEED = void 0;
exports.CREATOR_SEED = process.env.CREATOR_SEED || '010io-iq-auth';
exports.VERSION_SEED = process.env.VERSION_SEED || 'auto';
exports.SYSTEM_NAME = 'iQ-auth';
exports.SYSTEM_VERSION = '0.1.0';
/**
 * Supported authentication methods
 */
exports.AUTH_METHODS = {
    FIDO2: 'fido2',
    BIOMETRIC: 'biometric',
    BLOCKCHAIN: 'blockchain',
    GOVERNMENT: 'government',
    SOCIAL: 'social',
    PASSWORD: 'password',
    DEVICE: 'device',
};
/**
 * Identity types supported by the multi-ID registry
 */
exports.IDENTITY_TYPES = {
    DEVICE: 'device',
    BIOMETRIC: 'biometric',
    SOCIAL: 'social',
    WALLET: 'wallet',
    GOVERNMENT: 'government',
};
//# sourceMappingURL=constants.js.map