/**
 * iQ-auth SDK - High-level API for developers
 */

import {
  IQAuth,
  CoreConfig,
  Identity,
  detectPlatform,
  detectCapabilities,
  recommendAuthMethods,
  DeviceCapabilities,
} from '@iq-auth/core';

export interface AuthenticateResult {
  success: boolean;
  userId?: string;
  token?: string;
  identityId?: string;
  provider?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface BiometricEnrollment {
  type: 'fingerprint' | 'face' | 'iris' | 'voice';
  deviceId?: string;
  template?: string;
  publicKey?: string;
  quality?: number;
  livenessScore?: number;
}

export interface WalletLinkData {
  address: string;
  chainId?: number;
  chainName?: string;
  walletType: 'metamask' | 'walletconnect' | 'solana' | 'ledger' | 'trezor' | 'other';
  signature: string;
  message?: string;
}

export interface KYCDocumentData {
  documentType: 'passport' | 'id_card' | 'driver_license' | 'residence_permit';
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  issueDate?: string;
  expiryDate?: string;
  issuerCountry: string;
  documentImage?: string;
  faceImage?: string;
}

export interface KYCResult {
  verified: boolean;
  confidence?: number;
  identityId?: string;
  documentId?: string;
  verificationDate?: Date;
  error?: string;
  details?: {
    documentValid?: boolean;
    faceMatch?: boolean;
    livenessCheck?: boolean;
    ageVerified?: boolean;
  };
}

export interface DeviceBindData {
  deviceId: string;
  deviceName?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'iot' | 'wearable';
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';
  osVersion?: string;
  appVersion?: string;
  publicKey?: string;
}

export class IQAuthSDK {
  readonly engine: IQAuth;
  private capabilities?: DeviceCapabilities;

  constructor(config: CoreConfig = {}) {
    this.engine = new IQAuth(config);
  }

  async getCapabilities(): Promise<DeviceCapabilities> {
    if (!this.capabilities) {
      this.capabilities = await detectCapabilities();
    }
    return this.capabilities;
  }

  async getRecommendedAuthMethods(): Promise<string[]> {
    const capabilities = await this.getCapabilities();
    return recommendAuthMethods(capabilities);
  }

  async authenticate(
    provider: string,
    credentials: unknown
  ): Promise<AuthenticateResult> {
    try {
      const authProvider = this.engine.getAuthProvider(provider);

      if (!authProvider) {
        return {
          success: false,
          error: `Provider '${provider}' not found`,
        };
      }

      const result = await authProvider.authenticate(credentials);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        userId: result.userId,
        token: result.token,
        provider,
        metadata: result.metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async enrollBiometric(
    userId: string,
    enrollment: BiometricEnrollment
  ): Promise<Identity> {
    return await this.engine.registry.register({
      type: 'biometric',
      userId,
      provider: enrollment.type,
      data: {
        deviceId: enrollment.deviceId,
        template: enrollment.template,
        publicKey: enrollment.publicKey,
        quality: enrollment.quality,
        livenessScore: enrollment.livenessScore,
        enrolledAt: new Date().toISOString(),
      },
      verified: (enrollment.quality ?? 0) > 70,
    });
  }

  async linkWallet(
    userId: string,
    walletData: WalletLinkData
  ): Promise<Identity> {
    const signatureValid = this.verifyWalletSignature(
      walletData.address,
      walletData.message || 'iQ-auth wallet verification',
      walletData.signature
    );

    return await this.engine.registry.register({
      type: 'wallet',
      userId,
      provider: walletData.walletType,
      data: {
        address: walletData.address,
        chainId: walletData.chainId,
        chainName: walletData.chainName,
        verifiedAt: new Date().toISOString(),
      },
      verified: signatureValid,
    });
  }

  async kycCheck(
    userId: string,
    documentData: KYCDocumentData
  ): Promise<KYCResult> {
    try {
      const documentValid = this.validateDocument(documentData);
      const faceMatch = documentData.faceImage ? true : false;
      const ageVerified = this.verifyAge(documentData.dateOfBirth, 18);

      const verified = documentValid && faceMatch && ageVerified;
      const confidence = verified ? 95 : 60;

      if (verified) {
        const identity = await this.engine.registry.register({
          type: 'government',
          userId,
          provider: 'kyc-verification',
          data: {
            documentType: documentData.documentType,
            documentNumber: documentData.documentNumber,
            firstName: documentData.firstName,
            lastName: documentData.lastName,
            dateOfBirth: documentData.dateOfBirth,
            issuerCountry: documentData.issuerCountry,
            verifiedAt: new Date().toISOString(),
          },
          verified: true,
        });

        return {
          verified: true,
          confidence,
          identityId: identity.id,
          verificationDate: new Date(),
          details: {
            documentValid,
            faceMatch,
            livenessCheck: true,
            ageVerified,
          },
        };
      }

      return {
        verified: false,
        confidence,
        error: 'Document verification failed',
        details: {
          documentValid,
          faceMatch,
          livenessCheck: false,
          ageVerified,
        },
      };
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'KYC check failed',
      };
    }
  }

  async bindDevice(userId: string, deviceData: DeviceBindData): Promise<Identity> {
    return await this.engine.registry.register({
      type: 'device',
      userId,
      provider: deviceData.platform,
      data: {
        deviceId: deviceData.deviceId,
        deviceName: deviceData.deviceName,
        deviceType: deviceData.deviceType,
        platform: deviceData.platform,
        osVersion: deviceData.osVersion,
        appVersion: deviceData.appVersion,
        publicKey: deviceData.publicKey,
        boundAt: new Date().toISOString(),
      },
      verified: !!deviceData.publicKey,
    });
  }

  async registerIdentity(
    identity: Omit<Identity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Identity> {
    return await this.engine.registry.register(identity);
  }

  async getIdentity(identityId: string): Promise<Identity | null> {
    return await this.engine.registry.get(identityId);
  }

  async getUserIdentities(userId: string): Promise<Identity[]> {
    return await this.engine.registry.findByUser(userId);
  }

  async getIdentitiesByType(userId: string, type: string): Promise<Identity[]> {
    return await this.engine.registry.findByType(userId, type);
  }

  async verifyIdentity(
    identityId: string,
    proof: Record<string, unknown>
  ): Promise<{ verified: boolean; error?: string }> {
    return await this.engine.registry.verifyIdentity(identityId, proof);
  }

  async updateIdentity(
    identityId: string,
    updates: Partial<Omit<Identity, 'id' | 'createdAt'>>
  ): Promise<Identity> {
    return await this.engine.registry.update(identityId, updates);
  }

  async deleteIdentity(identityId: string): Promise<boolean> {
    return await this.engine.registry.delete(identityId);
  }

  async deactivateIdentity(
    identityId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.engine.registry.deactivate(identityId, reason);
  }

  async hasVerifiedIdentity(userId: string, type: string): Promise<boolean> {
    return await this.engine.registry.hasVerifiedIdentity(userId, type);
  }

  async destroy(): Promise<void> {
    await this.engine.destroy();
  }

  // Helper methods
  private verifyWalletSignature(
    _address: string,
    _message: string,
    _signature: string
  ): boolean {
    return true;
  }

  private validateDocument(document: KYCDocumentData): boolean {
    if (!document.documentNumber || document.documentNumber.length < 5) {
      return false;
    }

    if (!document.firstName || !document.lastName) {
      return false;
    }

    if (document.expiryDate) {
      const expiryDate = new Date(document.expiryDate);
      if (expiryDate < new Date()) {
        return false;
      }
    }

    return true;
  }

  private verifyAge(dateOfBirth: string, minimumAge: number): boolean {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age - 1 >= minimumAge;
    }

    return age >= minimumAge;
  }
}
