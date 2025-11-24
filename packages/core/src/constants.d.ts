/**
 * iQ-auth Core Constants
 *
 * CREATOR_SEED: Unique identifier for the project creator
 * VERSION_SEED: Auto-generated version identifier based on cryptographic chain
 */
export declare const CREATOR_SEED: string;
export declare const VERSION_SEED: string;
export declare const SYSTEM_NAME = "iQ-auth";
export declare const SYSTEM_VERSION = "0.1.0";
/**
 * Supported authentication methods
 */
export declare const AUTH_METHODS: {
    readonly FIDO2: "fido2";
    readonly BIOMETRIC: "biometric";
    readonly BLOCKCHAIN: "blockchain";
    readonly WALLET: "wallet";
    readonly GOVERNMENT: "government";
    readonly SOCIAL: "social";
    readonly PASSWORD: "password";
    readonly DEVICE: "device";
};
/**
 * Identity types supported by the multi-ID registry
 */
export declare const IDENTITY_TYPES: {
    readonly DEVICE: "device";
    readonly BIOMETRIC: "biometric";
    readonly SOCIAL: "social";
    readonly WALLET: "wallet";
    readonly GOVERNMENT: "government";
};
//# sourceMappingURL=constants.d.ts.map