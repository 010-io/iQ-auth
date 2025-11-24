# Device Detection Utilities

Device detection module для автоматичного визначення платформи, можливостей пристрою та рекомендації методів автентифікації.

## Quick Start

```typescript
import {
  detectPlatform,
  detectCapabilities,
  recommendAuthMethods,
} from '@iq-auth/core';

// Detect platform
const platform = detectPlatform();
// Returns: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web'

// Get device capabilities
const capabilities = await detectCapabilities();
console.log(capabilities);
/*
{
  platform: 'android',
  platformVersion: 'Android 14',
  deviceModel: 'Xiaomi POCO C65',
  deviceId: 'device-123',
  hasHardwareKeys: true,
  hasBiometric: true,
  biometricTypes: ['fingerprint'],
  hasNFC: true,
  hasBluetooth: true,
  hasTPM: false,
  hasSecureElement: true,
  securityLevel: 'strongbox',
  hasWiFi: true,
  hasCellular: true,
  hasVPN: false,
  isRooted: false,
  isEmulator: false,
  screenSize: { width: 1080, height: 2400 }
}
*/

// Get recommended auth methods
const authMethods = recommendAuthMethods(capabilities);
console.log(authMethods);
// ['fido2', 'biometric', 'device-key', 'nfc', 'bluetooth', 'email-password']
```

## Platform Detection

### Supported Platforms

- `android` - Android devices (phones, tablets)
- `ios` - iOS devices (iPhone, iPad, iPod Touch)
- `macos` - macOS (MacBook, iMac, Mac Pro)
- `windows` - Windows (PCs, Surface, tablets)
- `linux` - Linux distributions
- `web` - Web browsers
- `unknown` - Unrecognized platform

### Browser Detection

Uses `navigator.userAgent` to identify platform:

```typescript
const platform = detectPlatform();

if (platform === 'android') {
  // Android-specific code
} else if (platform === 'ios') {
  // iOS-specific code
}
```

## Capability Detection

### Device Capabilities Object

```typescript
interface DeviceCapabilities {
  // Platform info
  platform: Platform;
  platformVersion: string;
  deviceModel: string;
  deviceId: string;

  // Security features
  hasHardwareKeys: boolean;
  hasBiometric: boolean;
  biometricTypes: BiometricType[];
  hasNFC: boolean;
  hasBluetooth: boolean;
  hasTPM: boolean;
  hasSecureElement: boolean;
  securityLevel: SecurityLevel;

  // Network
  hasWiFi: boolean;
  hasCellular: boolean;
  hasVPN: boolean;

  // Security concerns
  isRooted: boolean;
  isEmulator: boolean;

  // Display
  screenSize: { width: number; height: number };
}
```

### Security Levels

- `software` - Software-only security (no hardware backing)
- `hardware` - Hardware-backed keys (Android Keystore)
- `strongbox` - Android StrongBox (dedicated security chip)
- `secure_enclave` - iOS Secure Enclave
- `tpm` - Trusted Platform Module (Windows)

### Biometric Types

- `fingerprint` - Fingerprint sensor
- `face` - Face recognition (Face ID, Windows Hello Face)
- `iris` - Iris scanner
- `voice` - Voice recognition

## Recommended Auth Methods

Based on device capabilities, the system recommends appropriate authentication methods:

```typescript
const authMethods = recommendAuthMethods(capabilities);
```

### Priority Order

1. **FIDO2** - If hardware-backed keys available
2. **Biometric** - If biometric sensors present
3. **Device Key** - If Keystore/Secure Enclave/TPM available
4. **NFC** - If NFC available
5. **Bluetooth** - If BLE available
6. **Email/Password** - Always available as fallback

### Security Restrictions

For rooted/jailbroken devices, only basic authentication is allowed:

```typescript
if (capabilities.isRooted) {
  // Only email/password allowed
  return ['email-password'];
}
```

## Platform-Specific Implementation

### Android

Detects:
- Android Keystore
- StrongBox (Android 9+)
- SafetyNet attestation
- Biometric API
- NFC support
- Root detection

### iOS

Detects:
- Secure Enclave
- Face ID / Touch ID
- NFC (iPhone 7+)
- Jailbreak detection

### Windows

Detects:
- TPM 2.0
- Windows Hello (biometric)
- Bluetooth support

### Web

Detects:
- WebAuthn support
- Web Bluetooth API
- NFC Web API

## Usage Examples

### Conditional Authentication

```typescript
const capabilities = await detectCapabilities();

if (capabilities.hasBiometric) {
  // Use biometric auth
  await authenticateWithBiometric();
} else if (capabilities.hasHardwareKeys) {
  // Use device key
  await authenticateWithDeviceKey();
} else {
  // Fallback to password
  await authenticateWithPassword();
}
```

### Security Policy Enforcement

```typescript
const capabilities = await detectCapabilities();

// Require hardware-backed auth for high-security operations
if (
  ['hardware', 'strongbox', 'secure_enclave', 'tpm'].includes(
    capabilities.securityLevel
  )
) {
  // Allow sensitive operations
  await performSensitiveOperation();
} else {
  throw new Error('Hardware-backed authentication required');
}
```

### Device Fingerprinting

```typescript
const capabilities = await detectCapabilities();

const fingerprint = {
  platform: capabilities.platform,
  model: capabilities.deviceModel,
  securityLevel: capabilities.securityLevel,
  screenSize: capabilities.screenSize,
};

// Use for device tracking/verification
```

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Platform detection | ✅ Implemented | All platforms supported |
| Web capabilities | ✅ Implemented | WebAuthn, Web Bluetooth, NFC |
| Android capabilities | 📋 Placeholder | Requires native integration |
| iOS capabilities | 📋 Placeholder | Requires native integration |
| Windows capabilities | 📋 Placeholder | Requires native integration |
| Root/jailbreak detection | 📋 Placeholder | Security feature |

**Legend:** ✅ Implemented | 📋 Placeholder (future)

## Future Enhancements

- [ ] Real Android Keystore detection
- [ ] Real iOS Secure Enclave detection
- [ ] Real TPM detection
- [ ] Advanced root/jailbreak detection
- [ ] Device attestation verification
- [ ] Hardware security module detection
- [ ] Network security detection (VPN, firewall)
- [ ] Emulator/simulator detection improvements

## See Also

- [Device Support Matrix](../../../docs/DEVICE_SUPPORT.md)
- [Platform Adapter Interfaces](../types/platform.ts)
- [Core README](../../README.md)

---

**Note:** Current implementation provides web-based detection. Platform-specific implementations require native mobile/desktop integration.
