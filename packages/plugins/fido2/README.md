# @iq-auth/plugin-fido2

FIDO2/WebAuthn authentication plugin for iQ-auth.

## Features

- ✅ Full WebAuthn API integration
- ✅ Registration ceremony (credential creation)
- ✅ Authentication ceremony (assertion)
- ✅ Hardware-backed authenticators support
- ✅ Platform authenticators (Face ID, Touch ID, Windows Hello, fingerprint)
- ✅ Roaming authenticators (USB security keys like YubiKey, Titan)
- ✅ Challenge-based security
- ✅ Counter-based replay attack protection
- ✅ Multiple credentials per user
- ✅ Credential management (list, delete)

## Installation

```bash
pnpm add @iq-auth/plugin-fido2
```

## Usage

### Basic Setup

```typescript
import { IQAuth } from '@iq-auth/core';
import { FIDO2Plugin } from '@iq-auth/plugin-fido2';

// Create FIDO2 plugin
const fido2Plugin = new FIDO2Plugin({
  rpName: 'My App',
  rpId: 'example.com', // Your domain
  origin: 'https://example.com',
  timeout: 60000, // 60 seconds
  attestation: 'none', // or 'direct' for hardware attestation
  userVerification: 'preferred', // 'required' | 'preferred' | 'discouraged'
});

// Initialize iQ-auth with FIDO2 plugin
const auth = new IQAuth({
  plugins: [fido2Plugin],
});

await auth.plugins.initialize('fido2', {
  rpName: 'My App',
  rpId: 'example.com',
  origin: 'https://example.com',
});
```

### Registration Flow

```typescript
import { FIDO2Provider } from '@iq-auth/plugin-fido2';

const provider = new FIDO2Provider({
  rpName: 'My App',
  rpId: 'example.com',
  origin: 'https://example.com',
});

// Register new credential
try {
  const credential = await provider.register({
    userId: 'user-123',
    userName: 'user@example.com',
    userDisplayName: 'John Doe',
  });

  console.log('Credential registered:', credential.id);
  console.log('Public key:', credential.publicKey);
  console.log('Transports:', credential.transports); // ['internal', 'usb', 'nfc', 'ble']
} catch (error) {
  console.error('Registration failed:', error);
}
```

### Authentication Flow

```typescript
// Get user's registered credentials
const userCredentials = provider.getUserCredentials('user-123');

// Authenticate
const result = await provider.authenticate({
  allowCredentials: userCredentials,
  userVerification: 'preferred',
});

if (result.success) {
  console.log('Authentication successful!');
  console.log('User ID:', result.userId);
  console.log('Session token:', result.token);
  console.log('Counter:', result.metadata?.counter);
} else {
  console.error('Authentication failed:', result.error);
}
```

### Verify Session Token

```typescript
const verifyResult = await provider.verify(sessionToken);

if (verifyResult.valid) {
  console.log('Token valid for user:', verifyResult.userId);
  console.log('Expires at:', verifyResult.expiresAt);
} else {
  console.error('Token invalid:', verifyResult.error);
}
```

### Check Platform Support

```typescript
// Check if WebAuthn is supported
if (provider.isSupported()) {
  console.log('WebAuthn is supported');
}

// Check if platform authenticator available (Face ID, Touch ID, etc.)
const hasPlatformAuth = await provider.isPlatformAuthenticatorAvailable();
console.log('Platform authenticator:', hasPlatformAuth ? 'Available' : 'Not available');
```

### Advanced Configuration

```typescript
// Platform authenticator only (Face ID, Touch ID, Windows Hello)
const platformProvider = new FIDO2Provider({
  rpName: 'My App',
  rpId: 'example.com',
  origin: 'https://example.com',
  authenticatorSelection: {
    authenticatorAttachment: 'platform',
    requireResidentKey: false,
    userVerification: 'required',
  },
});

// Cross-platform authenticator (USB security keys)
const securityKeyProvider = new FIDO2Provider({
  rpName: 'My App',
  rpId: 'example.com',
  origin: 'https://example.com',
  authenticatorSelection: {
    authenticatorAttachment: 'cross-platform',
    requireResidentKey: false,
    userVerification: 'preferred',
  },
});

// Enterprise attestation (for corporate environments)
const enterpriseProvider = new FIDO2Provider({
  rpName: 'Corp App', 
  rpId: 'corp.example.com',
  origin: 'https://corp.example.com',
  attestation: 'enterprise',
  authenticatorSelection: {
    userVerification: 'required',
  },
});
```

### Credential Management

```typescript
// List all credentials for a user
const credentials = provider.getUserCredentials('user-123');
console.log(`User has ${credentials.length} credentials`);

credentials.forEach(cred => {
  console.log('- Credential ID:', cred.id);
  console.log('  Created:', cred.createdAt);
  console.log('  Transports:', cred.transports);
  console.log('  Counter:', cred.counter);
});

// Delete a credential
const deleted = provider.deleteCredential('credential-id');
console.log('Deleted:', deleted);
```

## Platform Support

| Platform | Authenticator Type | Support |
|----------|-------------------|---------|
| **Chrome/Edge** | Platform (Windows Hello, Touch ID) | ✅ Full support |
| **Chrome/Edge** | USB Security Keys (YubiKey, Titan) | ✅ Full support |
| **Firefox** | Platform + USB | ✅ Full support |
| **Safari** | Platform (Face ID, Touch ID) | ✅ Full support |
| **Safari** | USB Security Keys | ✅ iOS 13.3+, macOS 10.15+ |
| **Android Chrome** | Platform (Fingerprint) | ✅ Android 7+ |
| **iOS Safari** | Platform (Face ID, Touch ID) | ✅ iOS 14+ |

## Security Features

### Challenge-Response

Every authentication request uses a unique cryptographic challenge to prevent replay attacks.

### Counter Protection

Each authenticator maintains a signature counter that increments with each use. The provider validates that the counter always increases, detecting cloned authenticators.

### Origin Validation

All WebAuthn operations validate the origin matches the configured `rpId` and `origin`, preventing phishing attacks.

### Hardware Attestation

With `attestation: 'direct'` or `attestation: 'enterprise'`, the provider receives cryptographic proof of the authenticator's make and model, enabling policy enforcement (e.g., only allow YubiKey 5 series).

## API Reference

### FIDO2Provider

#### Methods

- `isSupported(): boolean` - Check WebAuthn support
- `isPlatformAuthenticatorAvailable(): Promise<boolean>` - Check platform authenticator
- `register(options): Promise<FIDO2Credential>` - Register new credential
- `authenticate(options): Promise<AuthResult>` - Authenticate with credential
- `verify(token): Promise<VerifyResult>` - Verify session token
- `getUserCredentials(userId): FIDO2Credential[]` - Get user's credentials
- `deleteCredential(credentialId): boolean` - Delete credential

#### Types

```typescript
interface FIDO2Config {
  rpName: string;
  rpId: string;
  origin: string;
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

interface FIDO2Credential {
  id: string;
  publicKey: string;
  counter: number;
  userId: string;
  transports?: AuthenticatorTransport[];
  attestationType?: string;
  aaguid?: string;
  createdAt: Date;
}

interface RegistrationOptions {
  userId: string;
  userName: string;
  userDisplayName: string;
  excludeCredentials?: FIDO2Credential[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
}

interface AuthenticationOptions {
  allowCredentials?: FIDO2Credential[];
  userVerification?: UserVerificationRequirement;
}
```

## Browser Compatibility

Requires browsers with WebAuthn Level 1 or Level 2 support:
- Chrome 67+
- Firefox 60+
- Safari 13+
- Edge 18+

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## Troubleshooting

### "WebAuthn is not supported"

Ensure you're running on:
- HTTPS (or `localhost` for development)
- A supported browser (see Browser Compatibility)

### "Registration failed: origin mismatch"

The `origin` in your config must match the actual origin of your website (including protocol and port).

```typescript
// Development
origin: 'http://localhost:3000'

// Production
origin: 'https://example.com'
```

### "Invalid counter - possible cloned authenticator"

This security error indicates the authenticator's signature counter didn't increase, suggesting:
- The authenticator was cloned
- The same credential is being used from multiple devices
- Database corruption

For security, the credential should be revoked.

## License

MIT © Igor Omelchenko (010io)

---

Made with ❤️ for Ukrainian GovTech 🇺🇦
