/**
 * Device Detection Utility
 * 
 * Automatically detects platform, capabilities, and recommends authentication methods
 */

export type Platform =
  | 'android'
  | 'ios'
  | 'windows'
  | 'macos'
  | 'linux'
  | 'web'
  | 'unknown';

export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'voice';

export type SecurityLevel =
  | 'software'
  | 'hardware'
  | 'strongbox'
  | 'secure_enclave'
  | 'tpm';

export interface DeviceCapabilities {
  platform: Platform;
  platformVersion: string;
  deviceModel: string;
  deviceId: string;

  // Security
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

  // Additional
  isRooted: boolean; // Android root / iOS jailbreak
  isEmulator: boolean;
  screenSize: { width: number; height: number };
}

/**
 * Detect current platform
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    // Node.js environment
    const platform = process.platform;
    if (platform === 'darwin') return 'macos';
    if (platform === 'win32') return 'windows';
    if (platform === 'linux') return 'linux';
    return 'unknown';
  }

  // Browser/Mobile environment
  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  if (/macintosh|mac os x/.test(userAgent)) return 'macos';
  if (/windows/.test(userAgent)) return 'windows';
  if (/linux/.test(userAgent)) return 'linux';

  return 'web';
}

/**
 * Detect device capabilities
 */
export async function detectCapabilities(): Promise<DeviceCapabilities> {
  const platform = detectPlatform();

  const capabilities: DeviceCapabilities = {
    platform,
    platformVersion: await getPlatformVersion(),
    deviceModel: await getDeviceModel(),
    deviceId: await getDeviceId(),
    hasHardwareKeys: false,
    hasBiometric: false,
    biometricTypes: [],
    hasNFC: false,
    hasBluetooth: false,
    hasTPM: false,
    hasSecureElement: false,
    securityLevel: 'software',
    hasWiFi: typeof navigator !== 'undefined' && 'connection' in navigator,
    hasCellular: false,
    hasVPN: false,
    isRooted: false,
    isEmulator: false,
    screenSize: getScreenSize(),
  };

  // Platform-specific detection
  if (platform === 'android') {
    await detectAndroidCapabilities(capabilities);
  } else if (platform === 'ios') {
    await detectIOSCapabilities(capabilities);
  } else if (platform === 'windows') {
    await detectWindowsCapabilities(capabilities);
  } else if (platform === 'web') {
    await detectWebCapabilities(capabilities);
  }

  return capabilities;
}

/**
 * Android-specific capability detection
 */
async function detectAndroidCapabilities(
  capabilities: DeviceCapabilities
): Promise<void> {
  // Check for Keystore support
  capabilities.hasHardwareKeys = await checkAndroidKeystore();

  // Check for StrongBox
  if (await checkStrongBox()) {
    capabilities.securityLevel = 'strongbox';
    capabilities.hasSecureElement = true;
  } else if (capabilities.hasHardwareKeys) {
    capabilities.securityLevel = 'hardware';
  }

  // Check for biometrics
  const biometrics = await checkAndroidBiometrics();
  capabilities.hasBiometric = biometrics.length > 0;
  capabilities.biometricTypes = biometrics;

  // Check for NFC
  capabilities.hasNFC = await checkNFC();

  // Check for Bluetooth
  capabilities.hasBluetooth = await checkBluetooth();

  // Check for root
  capabilities.isRooted = await checkRoot();
}

/**
 * iOS-specific capability detection
 */
async function detectIOSCapabilities(
  capabilities: DeviceCapabilities
): Promise<void> {
  // Secure Enclave (iPhone 5s+)
  capabilities.hasHardwareKeys = await checkSecureEnclave();
  if (capabilities.hasHardwareKeys) {
    capabilities.securityLevel = 'secure_enclave';
 capabilities.hasSecureElement = true;
  }

  // Check for Face ID / Touch ID
  const biometrics = await checkIOSBiometrics();
  capabilities.hasBiometric = biometrics.length > 0;
  capabilities.biometricTypes = biometrics;

  // NFC (iPhone 7+)
  capabilities.hasNFC = await checkNFC();

  // Bluetooth
  capabilities.hasBluetooth = true; // All iOS devices have BLE

  // Jailbreak detection
  capabilities.isRooted = await checkJailbreak();
}

/**
 * Windows-specific capability detection
 */
async function detectWindowsCapabilities(
  capabilities: DeviceCapabilities
): Promise<void> {
  // TPM detection
  capabilities.hasTPM = await checkTPM();
  if (capabilities.hasTPM) {
    capabilities.securityLevel = 'tpm';
    capabilities.hasHardwareKeys = true;
  }

  // Windows Hello
  const biometrics = await checkWindowsHello();
  capabilities.hasBiometric = biometrics.length > 0;
  capabilities.biometricTypes = biometrics;

  // Bluetooth
  capabilities.hasBluetooth = await checkBluetooth();
}

/**
 * Web-specific capability detection
 */
async function detectWebCapabilities(
  capabilities: DeviceCapabilities
): Promise<void> {
  // WebAuthn support
  if (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential
  ) {
    capabilities.hasHardwareKeys = true;
    capabilities.hasBiometric =
      await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  // Bluetooth Web API
  if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
    capabilities.hasBluetooth = true;
  }

  // NFC Web API
  if (typeof window !== 'undefined' && 'NDEFReader' in window) {
    capabilities.hasNFC = true;
  }
}

/**
 * Recommend authentication methods based on capabilities
 */
export function recommendAuthMethods(
  capabilities: DeviceCapabilities
): string[] {
  const methods: string[] = [];

  // FIDO2/WebAuthn - highest priority if hardware-backed
  if (
    capabilities.hasHardwareKeys &&
    ['hardware', 'strongbox', 'secure_enclave', 'tpm'].includes(
      capabilities.securityLevel
    )
  ) {
    methods.push('fido2');
  }

  // Biometric
  if (capabilities.hasBiometric) {
    methods.push('biometric');
  }

  // Device key (Keystore/Secure Enclave/TPM)
  if (capabilities.hasHardwareKeys) {
    methods.push('device-key');
  }

  // NFC (for quick pairing, card auth)
  if (capabilities.hasNFC) {
    methods.push('nfc');
  }

  // Bluetooth (for device pairing, IoT)
  if (capabilities.hasBluetooth) {
    methods.push('bluetooth');
  }

  // Always include email/password as fallback
  methods.push('email-password');

  // Exclude on rooted/jailbroken devices (security concern)
  if (capabilities.isRooted) {
    console.warn('Device appears to be rooted/jailbroken. Limited auth methods.');
    return ['email-password']; // Only allow basic auth
  }

  return methods;
}

// Helper functions (placeholders - will be implemented per platform)

async function getPlatformVersion(): Promise<string> {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent;
  }
  return process.version || 'unknown';
}

async function getDeviceModel(): Promise<string> {
  if (typeof navigator !== 'undefined') {
    return navigator.platform || 'unknown';
  }
  return 'server';
}

async function getDeviceId(): Promise<string> {
  // TODO: Generate or retrieve stable device ID
  return 'temp-device-id';
}

function getScreenSize(): { width: number; height: number } {
  if (typeof window !== 'undefined') {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }
  return { width: 0, height: 0 };
}

async function checkAndroidKeystore(): Promise<boolean> {
  // TODO: Android-specific implementation
  return false;
}

async function checkStrongBox(): Promise<boolean> {
  // TODO: Android API level 28+ check
  return false;
}

async function checkAndroidBiometrics(): Promise<BiometricType[]> {
  // TODO: BiometricPrompt API check
  return [];
}

async function checkSecureEnclave(): Promise<boolean> {
  // TODO: iOS Secure Enclave check
  return false;
}

async function checkIOSBiometrics(): Promise<BiometricType[]> {
  // TODO: LAContext biometry check
  return [];
}

async function checkTPM(): Promise<boolean> {
  // TODO: Windows TPM check
  return false;
}

async function checkWindowsHello(): Promise<BiometricType[]> {
  // TODO: Windows Hello API check
  return [];
}

async function checkNFC(): Promise<boolean> {
  // TODO: Platform-specific NFC check
  return false;
}

async function checkBluetooth(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
    return true;
  }
  return false;
}

async function checkRoot(): Promise<boolean> {
  // TODO: Android root detection
  return false;
}

async function checkJailbreak(): Promise<boolean> {
  // TODO: iOS jailbreak detection
  return false;
}
