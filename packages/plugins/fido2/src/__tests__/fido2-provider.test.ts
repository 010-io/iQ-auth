/**
 * FIDO2 Provider Unit Tests
 */

import { FIDO2Provider, FIDO2Config, RegistrationOptions } from '../index';

// Mock WebAuthn API
const mockPublicKeyCredential = {
  isUserVerifyingPlatformAuthenticatorAvailable: jest.fn(),
};

const mockNavigator = {
  credentials: {
    create: jest.fn(),
    get: jest.fn(),
  },
};

describe('FIDO2Provider', () => {
  let provider: FIDO2Provider;
  let config: FIDO2Config;

  beforeAll(() => {
    // Setup global mocks
    global.window = {
      PublicKeyCredential: mockPublicKeyCredential as any,
    } as any;

    global.navigator = mockNavigator as any;

    global.crypto = {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
    } as any;

    global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
    global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
    global.TextEncoder = require('util').TextEncoder;
    global.TextDecoder = require('util').TextDecoder;
  });

  beforeEach(() => {
    config = {
      rpName: 'Test App',
      rpId: 'localhost',
      origin: 'http://localhost:3000',
      timeout: 60000,
      attestation: 'none',
      userVerification: 'preferred',
    };

    provider = new FIDO2Provider(config);

    jest.clearAllMocks();
  });

  describe('isSupported', () => {
    it('should return true when WebAuthn is available', () => {
      expect(provider.isSupported()).toBe(true);
    });

    it('should return false when WebAuthn is not available', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const tempProvider = new FIDO2Provider(config);
      expect(tempProvider.isSupported()).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('isPlatformAuthenticatorAvailable', () => {
    it('should check platform authenticator availability', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(
        true
      );

      const available = await provider.isPlatformAuthenticatorAvailable();

      expect(available).toBe(true);
      expect(
        mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
      ).toHaveBeenCalled();
    });

    it('should return false when WebAuthn not supported', async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const tempProvider = new FIDO2Provider(config);
      const available = await tempProvider.isPlatformAuthenticatorAvailable();

      expect(available).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('generateRegistrationOptions', () => {
    it('should generate valid registration options', async () => {
      const registrationOptions: RegistrationOptions = {
        userId: 'user-123',
        userName: 'test@example.com',
        userDisplayName: 'Test User',
      };

      const options = await provider.generateRegistrationOptions(
        registrationOptions
      );

      expect(options).toBeDefined();
      expect(options.rp.name).toBe(config.rpName);
      expect(options.rp.id).toBe(config.rpId);
      expect(options.user.name).toBe(registrationOptions.userName);
      expect(options.user.displayName).toBe(
        registrationOptions.userDisplayName
      );
      expect(options.challenge).toBeInstanceOf(ArrayBuffer);
      expect(options.pubKeyCredParams).toHaveLength(2);
      expect(options.timeout).toBe(config.timeout);
      expect(options.attestation).toBe(config.attestation);
    });

    it('should exclude specified credentials', async () => {
      const registrationOptions: RegistrationOptions = {
        userId: 'user-123',
        userName: 'test@example.com',
        userDisplayName: 'Test User',
        excludeCredentials: [
          {
            id: 'credential-1',
            publicKey: 'key-1',
            counter: 0,
            userId: 'user-123',
            createdAt: new Date(),
          },
        ],
      };

      const options = await provider.generateRegistrationOptions(
        registrationOptions
      );

      expect(options.excludeCredentials).toHaveLength(1);
      expect(options.excludeCredentials![0].type).toBe('public-key');
    });
  });

  describe('register', () => {
    it('should successfully register a credential', async () => {
      const mockCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(32),
        response: {
          attestationObject: new ArrayBuffer(64),
          clientDataJSON: new ArrayBuffer(128),
          getPublicKey: () => new ArrayBuffer(65),
          getTransports: () => ['internal'],
        },
        type: 'public-key',
      };

      const mockClientData = {
        type: 'webauthn.create',
        challenge: 'challenge',
        origin: config.origin,
      };

      mockNavigator.credentials.create.mockResolvedValue(mockCredential);

      // Mock JSON parse to return our client data
      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => mockClientData);

      const registrationOptions: RegistrationOptions = {
        userId: 'user-123',
        userName: 'test@example.com',
        userDisplayName: 'Test User',
      };

      const credential = await provider.register(registrationOptions);

      expect(credential).toBeDefined();
      expect(credential.userId).toBe('user-123');
      expect(credential.id).toBeDefined();
      expect(credential.publicKey).toBeDefined();
      expect(credential.counter).toBe(0);
      expect(credential.transports).toEqual(['internal']);

      JSON.parse = originalParse;
    });

    it('should throw error when registration fails', async () => {
      mockNavigator.credentials.create.mockResolvedValue(null);

      const registrationOptions: RegistrationOptions = {
        userId: 'user-123',
        userName: 'test@example.com',
        userDisplayName: 'Test User',
      };

      await expect(provider.register(registrationOptions)).rejects.toThrow(
        'Registration failed: no credential returned'
      );
    });

    it('should validate client data type', async () => {
      const mockCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(32),
        response: {
          attestationObject: new ArrayBuffer(64),
          clientDataJSON: new ArrayBuffer(128),
          getPublicKey: () => new ArrayBuffer(65),
          getTransports: () => [],
        },
        type: 'public-key',
      };

      mockNavigator.credentials.create.mockResolvedValue(mockCredential);

      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => ({
        type: 'invalid-type',
        origin: config.origin,
      }));

      const registrationOptions: RegistrationOptions = {
        userId: 'user-123',
        userName: 'test@example.com',
        userDisplayName: 'Test User',
      };

      await expect(provider.register(registrationOptions)).rejects.toThrow(
        'Invalid client data type'
      );

      JSON.parse = originalParse;
    });
  });

  describe('authenticate', () => {
    beforeEach(async () => {
      // Register a credential first
      const mockCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(32),
        response: {
          attestationObject: new ArrayBuffer(64),
          clientDataJSON: new ArrayBuffer(128),
          getPublicKey: () => new ArrayBuffer(65),
          getTransports: () => ['internal'],
        },
        type: 'public-key',
      };

      mockNavigator.credentials.create.mockResolvedValue(mockCredential);

      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => ({
        type: 'webauthn.create',
        origin: config.origin,
      }));

      await provider.register({
        userId: 'user-123',
        userName: 'test@example.com',
        userDisplayName: 'Test User',
      });

      JSON.parse = originalParse;
    });

    it('should successfully authenticate with credential', async () => {
      const mockAuthenticatorData = new Uint8Array(37);
      // Set counter (bytes 33-36) to 1
      mockAuthenticatorData[33] = 0;
      mockAuthenticatorData[34] = 0;
      mockAuthenticatorData[35] = 0;
      mockAuthenticatorData[36] = 1;

      const mockCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(32),
        response: {
          authenticatorData: mockAuthenticatorData.buffer,
          clientDataJSON: new ArrayBuffer(128),
          signature: new ArrayBuffer(64),
          userHandle: new ArrayBuffer(16),
        },
        type: 'public-key',
      };

      mockNavigator.credentials.get.mockResolvedValue(mockCredential);

      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => ({
        type: 'webauthn.get',
        origin: config.origin,
      }));

      const result = await provider.authenticate({});

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-123');
      expect(result.token).toBeDefined();
      expect(result.metadata?.counter).toBe(1);

      JSON.parse = originalParse;
    });

    it('should reject authentication with invalid counter', async () => {
      const mockAuthenticatorData = new Uint8Array(37);
      // Set counter to 0 (should be rejected as it's not greater than stored)
      mockAuthenticatorData[33] = 0;
      mockAuthenticatorData[34] = 0;
      mockAuthenticatorData[35] = 0;
      mockAuthenticatorData[36] = 0;

      const mockCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(32),
        response: {
          authenticatorData: mockAuthenticatorData.buffer,
          clientDataJSON: new ArrayBuffer(128),
          signature: new ArrayBuffer(64),
        },
        type: 'public-key',
      };

      mockNavigator.credentials.get.mockResolvedValue(mockCredential);

      const originalParse = JSON.parse;
      JSON.parse = jest.fn(() => ({
        type: 'webauthn.get',
        origin: config.origin,
      }));

      const result = await provider.authenticate({});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid counter');

      JSON.parse = originalParse;
    });
  });

  describe('verify', () => {
    it('should verify valid token', async () => {
      const userId = 'user-123';
      const timestamp = Date.now().toString();
      const signature = 'valid-signature';
      const token = `${userId}:${timestamp}:${signature}`;

      // We need to generate a real token from the provider
      const credential = {
        userId: 'user-123',
        id: 'cred-1',
        publicKey: 'key',
        counter: 0,
        createdAt: new Date(),
      };

      // Add credential to provider's storage
      (provider as any).credentials.set('cred-1', credential);

      // Generate real token
      const realToken = (provider as any).generateSessionToken(userId);

      const result = await provider.verify(realToken);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should reject invalid token format', async () => {
      const result = await provider.verify('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should reject expired token', async () => {
      const userId = 'user-123';
      const oldTimestamp = (Date.now() - 25 * 60 * 60 * 1000).toString(); // 25 hours ago
      const signature = (provider as any).signToken(userId, oldTimestamp);
      const token = `${userId}:${oldTimestamp}:${signature}`;

      const result = await provider.verify(token);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Token expired');
    });
  });

  describe('getUserCredentials', () => {
    it('should return all credentials for a user', async () => {
      const userId = 'user-123';

      // Manually add credentials
      (provider as any).credentials.set('cred-1', {
        id: 'cred-1',
        userId,
        publicKey: 'key1',
        counter: 0,
        createdAt: new Date(),
      });

      (provider as any).credentials.set('cred-2', {
        id: 'cred-2',
        userId,
        publicKey: 'key2',
        counter: 0,
        createdAt: new Date(),
      });

      (provider as any).credentials.set('cred-3', {
        id: 'cred-3',
        userId: 'other-user',
        publicKey: 'key3',
        counter: 0,
        createdAt: new Date(),
      });

      const credentials = provider.getUserCredentials(userId);

      expect(credentials).toHaveLength(2);
      expect(credentials.every(c => c.userId === userId)).toBe(true);
    });
  });

  describe('deleteCredential', () => {
    it('should delete credential', () => {
      (provider as any).credentials.set('cred-1', {
        id: 'cred-1',
        userId: 'user-123',
        publicKey: 'key1',
        counter: 0,
        createdAt: new Date(),
      });

      const deleted = provider.deleteCredential('cred-1');

      expect(deleted).toBe(true);
      expect((provider as any).credentials.has('cred-1')).toBe(false);
    });

    it('should return false for non-existent credential', () => {
      const deleted = provider.deleteCredential('non-existent');

      expect(deleted).toBe(false);
    });
  });
});
