/**
 * Platform Adapter Interface
 *
 * Base interface for platform-specific security implementations
 */
export interface IPlatformAdapter {
    readonly platform: 'android' | 'ios' | 'windows' | 'huawei' | 'web' | 'unknown';
    readonly name: string;
    readonly isAvailable: boolean;
    /**
     * Initialize the adapter
     */
    initialize(): Promise<void>;
    /**
     * Check if platform supports hardware-backed keys
     */
    supportsHardwareKeys(): Promise<boolean>;
    /**
     * Check if platform supports biometric authentication
     */
    supportsBiometric(): Promise<boolean>;
    /**
     * Get device information
     */
    getDeviceInfo(): Promise<DeviceInfo>;
    /**
     * Generate hardware-backed key pair
     */
    generateKeyPair(keyId: string): Promise<KeyPair>;
    /**
     * Sign data with hardware key
     */
    sign(keyId: string, data: string): Promise<string>;
    /**
     * Verify signature
     */
    verify(keyId: string, data: string, signature: string): Promise<boolean>;
    /**
     * Get hardware attestation
     */
    getAttestation?(keyId: string): Promise<AttestationResult>;
}
export interface DeviceInfo {
    platform: string;
    osVersion: string;
    deviceModel: string;
    deviceId: string;
    hasHardwareKeys: boolean;
    hasBiometric: boolean;
    biometricTypes?: ('fingerprint' | 'face' | 'iris')[];
    securityLevel?: 'software' | 'hardware' | 'strongbox' | 'secure_enclave';
}
export interface KeyPair {
    publicKey: string;
    privateKeyId: string;
    algorithm: string;
}
export interface AttestationResult {
    format: 'android-safetynet' | 'android-key' | 'apple' | 'tpm' | 'packed' | 'none';
    attestationObject: string;
    clientDataHash: string;
    verified: boolean;
    details?: Record<string, unknown>;
}
/**
 * Biometric Data Types
 */
export interface BiometricData {
    type: 'fingerprint' | 'face' | 'iris';
    template?: string;
    publicKey?: string;
    metadata?: {
        quality?: number;
        livenessScore?: number;
        enrollmentDate?: Date;
    };
}
/**
 * Wallet Data Types
 */
export interface WalletData {
    address: string;
    chainId?: number;
    chainName?: string;
    walletType: 'metamask' | 'walletconnect' | 'solana' | 'evm' | 'other';
    publicKey?: string;
}
/**
 * Social Identity Data
 */
export interface SocialIdentityData {
    provider: 'linkedin' | 'github' | 'google' | 'diia' | 'other';
    providerId: string;
    email?: string;
    name?: string;
    verified?: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
}
/**
 * KYC Document Data
 */
export interface KYCDocument {
    documentType: 'passport' | 'id_card' | 'driver_license' | 'residence_permit';
    documentNumber: string;
    issueDate?: Date;
    expiryDate?: Date;
    issuerCountry?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    verificationData?: Record<string, unknown>;
}
//# sourceMappingURL=platform.d.ts.map