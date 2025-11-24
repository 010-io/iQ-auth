# @iq-auth/core

Core authentication engine for iQ-auth framework.

## Features

- 🔌 Plugin-based architecture
- 🆔 Multi-ID registry (device, biometric, social, wallet, government)
- 💾 Pluggable storage adapters
- 🔐 Cryptographic chain support
- 🛡️ Platform adapters for hardware-backed security
- 🔑 Email/password authentication provider
- ✅ Identity verification and deactivation
- 🧪 Fully tested with >85% coverage

## Installation

```bash
pnpm add @iq-auth/core
```

## Usage

### Basic Setup

```typescript
import { IQAuth, InMemoryStorage } from '@iq-auth/core';

// Create instance with in-memory storage
const auth = new IQAuth({
  storage: new InMemoryStorage(),
  enabledAuthMethods: ['password', 'fido2', 'blockchain'],
});
```

### Email/Password Authentication

```typescript
import { EmailPasswordProvider } from '@iq-auth/core';

// Create provider
const emailProvider = new EmailPasswordProvider({
  passwordMinLength: 10,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
});

// Register user
await emailProvider.register(
  'user@example.com',
  'SecurePassword123!',
  'user-id-123'
);

// Authenticate
const result = await emailProvider.authenticate({
  email: 'user@example.com',
  password: 'SecurePassword123!',
});

if (result.success) {
  console.log('Authenticated:', result.userId);
  console.log('Token:', result.token);
}

// Verify token
const verifyResult = await emailProvider.verify(result.token!);
console.log('Token valid:', verifyResult.valid);
```

### Multi-ID Registry

```typescript
// Register different identity types
const walletIdentity = await auth.registry.register({
  type: 'wallet',
  userId: 'user-123',
  provider: 'metamask',
  data: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
  verified: false,
});

const deviceIdentity = await auth.registry.register({
  type: 'device',
  userId: 'user-123',
  provider: 'android',
  data: { deviceId: 'device-456' },
  verified: true,
});

// Verify identity
await auth.registry.verifyIdentity(walletIdentity.id, {
  signature: '0xabc...', // Signature proof
});

// Find all identities for a user
const identities = await auth.registry.findByUser('user-123');

// Find specific identity type
const wallets = await auth.registry.findByType('user-123', 'wallet');

// Check if user has verified identity
const hasVerifiedWallet = await auth.registry.hasVerifiedIdentity(
  'user-123',
  'wallet'
);

// Deactivate identity
await auth.registry.deactivate(deviceIdentity.id, 'Device lost');
```

### Platform Adapters

```typescript
import type { IPlatformAdapter, DeviceInfo } from '@iq-auth/core';

class AndroidKeystoreAdapter implements IPlatformAdapter {
  readonly platform = 'android';
  readonly name = 'Android Keystore';
  readonly isAvailable = true;

  async initialize() {
    // Platform-specific initialization
  }

  async supportsHardwareKeys() {
    return true;
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    return {
      platform: 'android',
      osVersion: '14',
      deviceModel: 'Pixel 8',
      deviceId: 'device-id',
      hasHardwareKeys: true,
      hasBiometric: true,
      biometricTypes: ['fingerprint'],
      securityLevel: 'strongbox',
    };
  }

  // Implement other methods...
}
```

## API Reference

### IQAuth

Main authentication engine class.

**Methods:**
- `plugins` - Access plugin loader
- `registry` - Access identity registry
- `getAuthProvider(name)` - Get authentication provider
- `destroy()` - Cleanup and destroy all plugins

### IdentityRegistry

Manages multiple identities for users.

**Methods:**
- `register(identity)` - Register новую identity
- `get(id)` - Get identity by ID
- `findByUser(userId)` - Get all user identities
- `update(id, data)` - Update identity
- `delete(id)` - Delete identity
- `verifyIdentity(id, proof)` - Verify identity
- `deactivate(id, reason)` - Deactivate identity
- `findByType(userId, type)` - Find by identity type
- `findByProvider(userId, provider)` - Find by provider
- `hasVerifiedIdentity(userId, type)` - Check verified identity

### EmailPasswordProvider

Email/password authentication provider.

**Methods:**
- `register(email, password, userId)` - Register user
- `authenticate(credentials)` - Authenticate user
- `verify(token)` - Verify auth token
- `changePassword(email, oldPassword, newPassword)` - Change password
- `deleteUser(email)` - Delete user

## Types

See [types.ts](./src/types.ts) and [types/platform.ts](./src/types/platform.ts) for full type definitions.

**Key Types:**
- `Identity` - User identity
- `IAuthProvider` - Auth provider interface
- `IPlatformAdapter` - Platform adapter interface
- `DeviceInfo` - Device information
- `BiometricData` - Biometric data
- `WalletData` - Wallet data
- `SocialIdentityData` - Social identity data

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## License

MIT © Igor Omelchenko (010io)
