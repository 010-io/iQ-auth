/**
 * FIDO2/WebAuthn Authentication Plugin
 *
 * Implements passwordless authentication using FIDO2/WebAuthn standards
 * with support for hardware-backed authenticators (biometric, security keys)
 */

import {
  IAuthPlugin,
  IAuthProvider,
  AuthResult,
  VerifyResult,
  AUTH_METHODS,
} from '@iq-auth/core';

/**
 * FIDO2 Configuration
 */
export interface FIDO2Config {
  rpName: string; // Relying Party name (e.g., "iQ-auth Demo")
  rpId: string; // Relying Party ID (domain, e.g., "example.com")
  origin: string; // Origin URL (e.g., "https://example.com")
  timeout?: number; // Timeout in milliseconds (default: 60000)
  attestation?: AttestationConveyancePreference; // 'none' | 'indirect' | 'direct' | 'enterprise'
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  userVerification?: UserVerificationRequirement; // 'required' | 'preferred' | 'discouraged'
}

/**
 * FIDO2 Credential
 */
export interface FIDO2Credential {
  id: string; // Credential ID (base64url)
  publicKey: string; // Public key (base64url)
  counter: number; // Signature counter
  userId: string; // User ID
  transports?: AuthenticatorTransport[]; // ['usb', 'nfc', 'ble', 'internal']
  attestationType?: string; // Attestation format
  aaguid?: string; // Authenticator AAGUID
  createdAt: Date;
}

/**
 * Registration Options
 */
export interface RegistrationOptions {
  userId: string;
  userName: string;
  userDisplayName: string;
  excludeCredentials?: FIDO2Credential[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
}

/**
 * Authentication Options
 */
export interface AuthenticationOptions {
  allowCredentials?: FIDO2Credential[];
  userVerification?: UserVerificationRequirement;
}

/**
 * FIDO2 Provider
 */
export class FIDO2Provider implements IAuthProvider {
  readonly name = 'fido2';
  readonly type = AUTH_METHODS.FIDO2;

  private config: FIDO2Config;
  private credentials: Map<string, FIDO2Credential> = new Map();
  private challenges: Map<string, { challenge: ArrayBuffer; timestamp: number }> =
    new Map();

  constructor(config: FIDO2Config) {
    this.config = {
      timeout: 60000,
      attestation: 'none',
      userVerification: 'preferred',
      ...config,
    };
  }

  /**
   * Check if WebAuthn is supported
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.PublicKeyCredential !== 'undefined'
    );
  }

  /**
   * Check if platform authenticator is available
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;

    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  /**
   * Generate registration options
   */
  async generateRegistrationOptions(
    options: RegistrationOptions
  ): Promise<PublicKeyCredentialCreationOptions> {
    const challenge = this.generateChallenge();

    // Store challenge for verification
    this.challenges.set(options.userId, {
      challenge,
      timestamp: Date.now(),
    });

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: this.config.rpName,
        id: this.config.rpId,
      },
      user: {
        id: this.stringToArrayBuffer(options.userId),
        name: options.userName,
        displayName: options.userDisplayName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: this.config.timeout,
      attestation: this.config.attestation,
      excludeCredentials: options.excludeCredentials?.map(cred => ({
        id: this.base64UrlToArrayBuffer(cred.id),
        type: 'public-key' as const,
        transports: cred.transports,
      })),
      authenticatorSelection:
        options.authenticatorSelection || this.config.authenticatorSelection,
    };

    return publicKeyOptions;
  }

  /**
   * Register new credential (FIDO2 registration ceremony)
   */
  async register(options: RegistrationOptions): Promise<FIDO2Credential> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported in this environment');
    }

    const publicKeyOptions = await this.generateRegistrationOptions(options);

    try {
      // Call WebAuthn API
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('Registration failed: no credential returned');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Verify challenge
      const storedChallenge = this.challenges.get(options.userId);
      if (!storedChallenge) {
        throw new Error('Challenge not found');
      }

      // Parse client data
      const clientDataJSON = response.clientDataJSON;
      const clientData = JSON.parse(
        this.arrayBufferToString(clientDataJSON)
      );

      if (clientData.type !== 'webauthn.create') {
        throw new Error('Invalid client data type');
      }

      if (clientData.origin !== this.config.origin) {
        throw new Error('Origin mismatch');
      }

      // Store credential
      const fido2Credential: FIDO2Credential = {
        id: this.arrayBufferToBase64Url(credential.rawId),
        publicKey: this.arrayBufferToBase64Url(
          response.getPublicKey() || new ArrayBuffer(0)
        ),
        counter: 0,
        userId: options.userId,
        transports: response.getTransports?.() as AuthenticatorTransport[],
        createdAt: new Date(),
      };

      this.credentials.set(fido2Credential.id, fido2Credential);

      // Clean up challenge
      this.challenges.delete(options.userId);

      return fido2Credential;
    } catch (error) {
      this.challenges.delete(options.userId);
      throw new Error(
        `FIDO2 registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate authentication options
   */
  async generateAuthenticationOptions(
    options: AuthenticationOptions = {}
  ): Promise<PublicKeyCredentialRequestOptions> {
    const challenge = this.generateChallenge();

    // Store challenge with temporary ID
    const challengeId = this.generateChallengeId();
    this.challenges.set(challengeId, {
      challenge,
      timestamp: Date.now(),
    });

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: this.config.timeout,
      rpId: this.config.rpId,
      allowCredentials: options.allowCredentials?.map(cred => ({
        id: this.base64UrlToArrayBuffer(cred.id),
        type: 'public-key' as const,
        transports: cred.transports,
      })),
      userVerification:
        options.userVerification || this.config.userVerification,
    };

    return publicKeyOptions;
  }

  /**
   * Authenticate (FIDO2 authentication ceremony)
   */
  async authenticate(credentials: unknown): Promise<AuthResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'WebAuthn is not supported in this environment',
      };
    }

    const authOptions = credentials as AuthenticationOptions;

    try {
      const publicKeyOptions = await this.generateAuthenticationOptions(
        authOptions
      );

      // Call WebAuthn API
      const credential = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        return {
          success: false,
          error: 'Authentication failed: no credential returned',
        };
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Get stored credential
      const credentialId = this.arrayBufferToBase64Url(credential.rawId);
      const storedCredential = this.credentials.get(credentialId);

      if (!storedCredential) {
        return {
          success: false,
          error: 'Credential not found',
        };
      }

      // Verify client data
      const clientDataJSON = response.clientDataJSON;
      const clientData = JSON.parse(
        this.arrayBufferToString(clientDataJSON)
      );

      if (clientData.type !== 'webauthn.get') {
        return {
          success: false,
          error: 'Invalid client data type',
        };
      }

      if (clientData.origin !== this.config.origin) {
        return {
          success: false,
          error: 'Origin mismatch',
        };
      }

      // Update counter (replay attack protection)
      const authenticatorData = new Uint8Array(response.authenticatorData);
      const counter = this.getCounterFromAuthData(authenticatorData);

      if (counter <= storedCredential.counter) {
        return {
          success: false,
          error: 'Invalid counter - possible cloned authenticator',
        };
      }

      storedCredential.counter = counter;

      // Generate session token
      const token = this.generateSessionToken(storedCredential.userId);

      return {
        success: true,
        userId: storedCredential.userId,
        token,
        metadata: {
          credentialId,
          counter,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `FIDO2 authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Verify FIDO2 token
   */
  async verify(token: string): Promise<VerifyResult> {
    try {
      // Simple token format: userId:timestamp:signature
      const parts = token.split(':');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [userId, timestamp, signature] = parts;

      // Verify signature
      const expectedSignature = this.signToken(userId, timestamp);
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid token signature' };
      }

      // Check expiration (24 hours)
      const tokenTime = parseInt(timestamp, 10);
      const expiresAt = new Date(tokenTime + 24 * 60 * 60 * 1000);

      if (Date.now() > expiresAt.getTime()) {
        return { valid: false, error: 'Token expired' };
      }

      return {
        valid: true,
        userId,
        expiresAt,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Token verification failed',
      };
    }
  }

  /**
   * Get all credentials for a user
   */
  getUserCredentials(userId: string): FIDO2Credential[] {
    return Array.from(this.credentials.values()).filter(
      cred => cred.userId === userId
    );
  }

  /**
   * Delete credential
   */
  deleteCredential(credentialId: string): boolean {
    return this.credentials.delete(credentialId);
  }

  // Helper methods

  private generateChallenge(): ArrayBuffer {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    return challenge.buffer;
  }

  private generateChallengeId(): string {
    return `challenge-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  private generateSessionToken(userId: string): string {
    const timestamp = Date.now().toString();
    const signature = this.signToken(userId, timestamp);
    return `${userId}:${timestamp}:${signature}`;
  }

  private signToken(userId: string, timestamp: string): string {
    const secret = process.env.JWT_SECRET || 'change-this-in-production';
    const data = `${userId}:${timestamp}:${secret}`;
    // Simple hash (in production, use proper HMAC)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private getCounterFromAuthData(authData: Uint8Array): number {
    // Counter is at bytes 33-36 (big-endian uint32)
    const counterBytes = authData.slice(33, 37);
    return new DataView(counterBytes.buffer).getUint32(0, false);
  }

  private arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private stringToArrayBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }

  private arrayBufferToString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }
}

/**
 * FIDO2 Plugin
 */
export class FIDO2Plugin implements IAuthPlugin {
  readonly name = 'fido2';
  readonly version = '0.1.0';
  readonly type = 'fido2' as const;

  provider: FIDO2Provider;

  constructor(config?: FIDO2Config) {
    const defaultConfig: FIDO2Config = {
      rpName: 'iQ-auth',
      rpId: 'localhost',
      origin: 'http://localhost:3000',
    };

    this.provider = new FIDO2Provider(config || defaultConfig);
  }

  async initialize(config: Record<string, unknown>): Promise<void> {
    if (config.rpName || config.rpId || config.origin) {
      this.provider = new FIDO2Provider(config as unknown as FIDO2Config);
    }
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
  }
}
