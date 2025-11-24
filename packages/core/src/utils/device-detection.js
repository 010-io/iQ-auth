"use strict";
/**
 * Device Detection Utility
 *
 * Automatically detects platform, capabilities, and recommends authentication methods
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPlatform = detectPlatform;
exports.detectCapabilities = detectCapabilities;
exports.recommendAuthMethods = recommendAuthMethods;
/**
 * Detect current platform
 */
function detectPlatform() {
    if (typeof window === 'undefined') {
        // Node.js environment
        const platform = process.platform;
        if (platform === 'darwin')
            return 'macos';
        if (platform === 'win32')
            return 'windows';
        if (platform === 'linux')
            return 'linux';
        return 'unknown';
    }
    // Browser/Mobile environment
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent))
        return 'android';
    if (/iphone|ipad|ipod/.test(userAgent))
        return 'ios';
    if (/macintosh|mac os x/.test(userAgent))
        return 'macos';
    if (/windows/.test(userAgent))
        return 'windows';
    if (/linux/.test(userAgent))
        return 'linux';
    return 'web';
}
/**
 * Detect device capabilities
 */
async function detectCapabilities() {
    const platform = detectPlatform();
    const capabilities = {
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
    }
    else if (platform === 'ios') {
        await detectIOSCapabilities(capabilities);
    }
    else if (platform === 'windows') {
        await detectWindowsCapabilities(capabilities);
    }
    else if (platform === 'web') {
        await detectWebCapabilities(capabilities);
    }
    return capabilities;
}
/**
 * Android-specific capability detection
 */
async function detectAndroidCapabilities(capabilities) {
    // Check for Keystore support
    capabilities.hasHardwareKeys = await checkAndroidKeystore();
    // Check for StrongBox
    if (await checkStrongBox()) {
        capabilities.securityLevel = 'strongbox';
        capabilities.hasSecureElement = true;
    }
    else if (capabilities.hasHardwareKeys) {
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
async function detectIOSCapabilities(capabilities) {
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
async function detectWindowsCapabilities(capabilities) {
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
async function detectWebCapabilities(capabilities) {
    // WebAuthn support
    if (typeof window !== 'undefined' &&
        window.PublicKeyCredential) {
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
function recommendAuthMethods(capabilities) {
    const methods = [];
    // FIDO2/WebAuthn - highest priority if hardware-backed
    if (capabilities.hasHardwareKeys &&
        ['hardware', 'strongbox', 'secure_enclave', 'tpm'].includes(capabilities.securityLevel)) {
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
async function getPlatformVersion() {
    if (typeof navigator !== 'undefined') {
        return navigator.userAgent;
    }
    return process.version || 'unknown';
}
async function getDeviceModel() {
    if (typeof navigator !== 'undefined') {
        return navigator.platform || 'unknown';
    }
    return 'server';
}
async function getDeviceId() {
    // TODO: Generate or retrieve stable device ID
    return 'temp-device-id';
}
function getScreenSize() {
    if (typeof window !== 'undefined') {
        return {
            width: window.screen.width,
            height: window.screen.height,
        };
    }
    return { width: 0, height: 0 };
}
async function checkAndroidKeystore() {
    // TODO: Android-specific implementation
    return false;
}
async function checkStrongBox() {
    // TODO: Android API level 28+ check
    return false;
}
async function checkAndroidBiometrics() {
    // TODO: BiometricPrompt API check
    return [];
}
async function checkSecureEnclave() {
    // TODO: iOS Secure Enclave check
    return false;
}
async function checkIOSBiometrics() {
    // TODO: LAContext biometry check
    return [];
}
async function checkTPM() {
    // TODO: Windows TPM check
    return false;
}
async function checkWindowsHello() {
    // TODO: Windows Hello API check
    return [];
}
async function checkNFC() {
    // TODO: Platform-specific NFC check
    return false;
}
async function checkBluetooth() {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
        return true;
    }
    return false;
}
async function checkRoot() {
    // TODO: Android root detection
    return false;
}
async function checkJailbreak() {
    // TODO: iOS jailbreak detection
    return false;
}
//# sourceMappingURL=device-detection.js.map