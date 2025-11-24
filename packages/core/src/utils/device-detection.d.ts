/**
 * Device Detection Utility
 *
 * Automatically detects platform, capabilities, and recommends authentication methods
 */
export type Platform = 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web' | 'unknown';
export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'voice';
export type SecurityLevel = 'software' | 'hardware' | 'strongbox' | 'secure_enclave' | 'tpm';
export interface DeviceCapabilities {
    platform: Platform;
    platformVersion: string;
    deviceModel: string;
    deviceId: string;
    hasHardwareKeys: boolean;
    hasBiometric: boolean;
    biometricTypes: BiometricType[];
    hasNFC: boolean;
    hasBluetooth: boolean;
    hasTPM: boolean;
    hasSecureElement: boolean;
    securityLevel: SecurityLevel;
    hasWiFi: boolean;
    hasCellular: boolean;
    hasVPN: boolean;
    isRooted: boolean;
    isEmulator: boolean;
    screenSize: {
        width: number;
        height: number;
    };
}
/**
 * Detect current platform
 */
export declare function detectPlatform(): Platform;
/**
 * Detect device capabilities
 */
export declare function detectCapabilities(): Promise<DeviceCapabilities>;
/**
 * Recommend authentication methods based on capabilities
 */
export declare function recommendAuthMethods(capabilities: DeviceCapabilities): string[];
//# sourceMappingURL=device-detection.d.ts.map