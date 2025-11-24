# iQ-auth Device & Protocol Support Matrix

**Version:** 0.1.0  
**Last Updated:** 2025-11-24  
**Status:** Implementation Roadmap

---

## 📱 Supported Device Categories

### 1. Smart Devices: Smartphones, Tablets, Laptops, PCs

| Category | Devices | Required Protocols | Unique Features |
|----------|---------|-------------------|-----------------|
| **Android** | Xiaomi, POCO, Samsung, Huawei, OnePlus, Google Pixel, Vertu, Bittium, Sirin, Blackphone | Android Keystore, SafetyNet, FIDO2, Google OAuth, Huawei ID, NFC, BLE, Biometric (face, fingerprint, iris), eSIM | Custom ROM support, Device attestation, TrustZone, StrongBox |
| **iOS/iPadOS** | iPhone, iPad, iPod Touch, Mac Pro, MacBook, iMac | Secure Enclave, Face ID, Touch ID, Apple OAuth, FIDO2/WebAuthn, MFi/Bluetooth, eSIM, NFC, BLE | Secure storage, Apple Sign-In, App sandboxing |
| **Windows** | Surface, Laptops, Desktops, Tablets | TPM 2.0, BitLocker, Windows Hello (face/fingerprint/PIN), U2F, Bluetooth, USB, Microsoft OAuth, WebAuthn | Device binding, Hardware security modules |
| **macOS** | MacBook Pro/Air, Mac Pro, iMac | Touch ID (T2/M1+), Secure Enclave, FIDO2/WebAuthn, Apple OAuth | Multi-user support, Enterprise profiles |
| **Linux/BSD** | Ubuntu, Debian, Purism Librem, Custom hardware | FIDO2/WebAuthn, TPM attestation, udev, Bluetooth, USB, OpenSSH PKI | Open source stack, Kernel-level crypto |

### 2. IoT / Embedded / Wearables

| Devices | Required Protocols | Unique Features |
|---------|-------------------|-----------------|
| **Smart Watches** | BLE, NFC, Biometric (heart rate, face), FIDO2 Lite | Companion pairing, Secure enclave, Voice auth |
| **Bluetooth Headphones** | BLE, Device ID, OUI, Pairing attestation | Fast pairing, Trusted device registry |
| **Home IoT** | Wi-Fi, Zigbee, Thread, BLE, OAuth, JWT | Multi-profile support, Device registry |
| **Automotive** | Bluetooth, NFC, CAN-Bus, CarPlay/Android Auto, UWB | Trusted driver profiles, Custom sensors |

### 3. Hardware-Crypto / Trusted / Secure Devices

| Devices | Required Protocols | Unique Features |
|---------|-------------------|-----------------|
| **Vertu, Bittium, Sirin** | Hardware encryption chip, TPM/Secure Element/TrustZone, Biometric, E2EE messaging, Custom VPN | Custom firewall/VPN, Device wipe, Lost mode, Concierge services |
| **Enterprise Laptops** | TPM, Fingerprint, Device binding, BitLocker, SmartCard | Hardware-level KYC, Recovery keys, Remote management |
| **Government Devices** | PKI, Smart Card, GOST (Russia excluded), Biometric, Secure containers | Federated identity, Airgap mode, Classified data |

### 4. Blockchain / Web3 / Wallets

| Wallet/Device | Required Protocols | Unique Features |
|---------------|-------------------|-----------------|
| **Software Wallets** | MetaMask, OneKey, Rainbow, Trust Wallet | ECDSA, EIP-712, WalletConnect, Address binding | Signing transactions, Chain identity |
| **Hardware Wallets** | Ledger, Trezor, GridPlus, SafePal | Seed phrase, Mnemonic entropy, Airgap QR, Hardware key | Cold storage, Multi-chain support |
| **Blockchain Platforms** | Ethereum, Solana, Polygon, BSC, Arbitrum, Optimism, TON | Chain-specific signatures, Message signing | Fast verification, Gas optimization |

### 5. Network / Mobile / Connectivity

| Protocol/Connection | Requirements | Unique Features |
|--------------------|-------------|-----------------|
| **Wi-Fi** | WPA2, WPA3, Device registry, Captive portal support | Trusted network detection, Auto-connect |
| **Cellular/5G** | eSIM, SIM ID, Operator identity | Multi-profile, Carrier binding |
| **VPN** | OpenVPN, WireGuard, Cisco AnyConnect | Network privacy, Remote KYC verification |
| **NFC/UWB/QR** | Pairing protocols, Device handshake, Quick-login | Secure pass exchange, Instant verification |

### 6. Cloud / Integrations / APIs

| Service | Required Protocols | Unique Features |
|---------|-------------------|-----------------|
| **Google/AWS/Azure** | OAuth2, OpenID Connect, Device Registry API, IAM | B2B integration, Federation, MFA |
| **Diia.gov.ua** | REST API, OAuth2, KYC API, Biometric/Passport scan | Government eID, KYC verification, Digital documents |
| **LinkedIn** | OAuth2, Verified API, Enterprise profiles | HR/KYC integration, Professional verification |
| **GitHub/Microsoft/Facebook** | OAuth2, Social login, SSO | Multi-factor auth, Federated identity |

---

## ⚡ Core Protocol Support

### Authentication Protocols

| Protocol | Status | Platforms | Description |
|----------|--------|-----------|-------------|
| **OAuth2 / OpenID Connect** | ✅ Planned | All | Google, Apple, Microsoft, Facebook, Diia, LinkedIn, Huawei, GitHub, Telegram |
| **FIDO2 / WebAuthn** | 🚧 In Progress | Web, Android, iOS, Windows | PKI-based, passwordless, biometric-backed |
| **SAML 2.0** | 📋 Roadmap | Enterprise | SSO for corporate environments |
| **JWT (JSON Web Tokens)** | ✅ Implemented | All | Token-based authentication |

### Hardware Security

| Technology | Status | Platforms | Description |
|-----------|--------|-----------|-------------|
| **TPM (Trusted Platform Module)** | 📋 Planned | Windows, Linux | Hardware-backed key storage |
| **Secure Enclave** | 📋 Planned | iOS, macOS | Apple's secure processor |
| **TrustZone** | 📋 Planned | Android | ARM TrustZone secure execution |
| **StrongBox** | 📋 Planned | Android 9+ | Hardware security module |
| **Secure Element** | 📋 Planned | Vertu, Secure phones | Dedicated crypto chip |

### Biometric Authentication

| Biometric Type | Status | Platforms | Description |
|---------------|--------|-----------|-------------|
| **Fingerprint** | 📋 Planned | Android, iOS, Windows | Touch ID, Fingerprint sensors |
| **Face Recognition** | 📋 Planned | Android, iOS, Windows | Face ID, Windows Hello Face |
| **Iris Scan** | 📋 Planned | Samsung, Secure devices | High-security iris recognition |
| **Voice Recognition** | 📋 Roadmap | Smart speakers, IoT | Voice-based authentication |
| **Multi-modal** | 📋 Roadmap | Enterprise | Combined biometrics |

### Connectivity Protocols

| Protocol | Status | Use Case | Description |
|----------|--------|----------|-------------|
| **BLE (Bluetooth Low Energy)** | 📋 Planned | IoT, Wearables | Fast device pairing |
| **NFC (Near Field Communication)** | 📋 Planned | Mobile, Cards | Tap-to-authenticate |
| **UWB (Ultra-Wideband)** | 📋 Roadmap | Automotive, Secure proximity | Precise location-based auth |
| **QR Codes** | 📋 Planned | Airgap wallets, Quick login | Offline authentication |

### Blockchain / Web3

| Technology | Status | Chains | Description |
|-----------|--------|--------|-------------|
| **WalletConnect** | 📋 Planned | Multi-chain | Wallet connection protocol |
| **MetaMask API** | 📋 Planned | EVM chains | Browser wallet integration |
| **Solana Wallet Adapter** | 📋 Planned | Solana | Solana ecosystem |
| **EIP-712 (Typed Signing)** | 📋 Planned | Ethereum | Structured data signing |
| **Hardware Wallet SDK** | 📋 Roadmap | Ledger, Trezor | Cold wallet integration |

### Government / Enterprise

| Technology | Status | Regions | Description |
|-----------|--------|---------|-------------|
| **Diia.gov.ua** | 📋 Planned | Ukraine | Government digital ID |
| **ICAO Passport Scan** | 📋 Roadmap | International | Passport NFC reading |
| **SmartCard / PKI** | 📋 Roadmap | Enterprise, Gov | Certificate-based auth |
| **eIDAS** | 📋 Roadmap | EU | European digital identity |

### Post-Quantum Cryptography

| Algorithm | Status | Description |
|-----------|--------|-------------|
| **Kyber** | 📋 Roadmap | NIST PQC key encapsulation |
| **Dilithium** | 📋 Roadmap | NIST PQC digital signatures |
| **Hybrid Mode** | 📋 Roadmap | Classical + PQC combination |

---

## 🏗️ Platform-Specific Implementation Status

### Android

| Feature | Status | API Level | Notes |
|---------|--------|-----------|-------|
| Keystore | 📋 Planned | 18+ | Basic key storage |
| StrongBox | 📋 Planned | 28+ | Hardware-backed keys |
| SafetyNet | 📋 Planned | All | Device attestation |
| Biometric API | 📋 Planned | 28+ | BiometricPrompt |
| NFC | 📋 Planned | 19+ | NFC reader/writer |

### iOS

| Feature | Status | Version | Notes |
|---------|--------|---------|-------|
| Secure Enclave | 📋 Planned | iOS 8+ | Hardware key storage |
| Face ID | 📋 Planned | iOS 11+ | 3D face recognition |
| Touch ID | 📋 Planned | iOS 8+ | Fingerprint |
| App Attest | 📋 Planned | iOS 14+ | App integrity |
| NFC | 📋 Planned | iOS 13+ | Core NFC |

### Windows

| Feature | Status | Version | Notes |
|---------|--------|---------|-------|
| TPM 2.0 | 📋 Planned | Win 10+ | Hardware security |
| Windows Hello | 📋 Planned | Win 10+ | Biometric auth |
| BitLocker | 📋 Roadmap | Win 10+ | Disk encryption |
| WebAuthn | 🚧 In Progress | Win 10+ | FIDO2 support |

---

## 📊 Device Detection & Auto-Configuration

iQ-auth automatically detects device capabilities and configures appropriate authentication methods:

```typescript
// Platform detection
const platform = detectPlatform();
// Returns: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web'

// Capability detection
const capabilities = await detectCapabilities();
// {
//   hasHardwareKeys: boolean,
//   hasBiometric: boolean,
//   biometricTypes: ['fingerprint', 'face', 'iris'],
//   hasNFC: boolean,
//   hasBluetooth: boolean,
//   hasTPM: boolean,
//   securityLevel: 'software' | 'hardware' | 'strongbox' | 'secure_enclave'
// }

// Recommended auth methods
const authMethods = recommendAuthMethods(capabilities);
// ['fido2', 'biometric', 'device-key', 'email-password']
```

---

## 🔒 Security Requirements by Device Category

| Device Category | Minimum Security | Recommended | Enterprise/Gov |
|----------------|------------------|-------------|----------------|
| **Consumer Mobile** | Password + 2FA | Biometric + Device Key | FIDO2 + Hardware attestation |
| **IoT/Wearables** | Device pairing | BLE attestation | Secure Element |
| **Secure Phones** | Hardware crypto | E2EE + VPN | Post-quantum ready |
| **Enterprise** | SmartCard/PKI | TPM + Biometric | Certificate + MFA |
| **Blockchain** | Seed phrase | Hardware wallet | Multi-sig + Cold storage |

---

## 📋 Compliance & Standards

| Standard | Status | Description |
|----------|--------|-------------|
| **FIDO2/WebAuthn** | 🚧 In Progress | Passwordless authentication |
| **OAuth 2.1** | 📋 Planned | Modern OAuth standard |
| **OpenID Connect** | 📋 Planned | Identity layer over OAuth |
| **NIST 800-63** | 📋 Roadmap | Digital identity guidelines |
| **GDPR** | ✅ Compliant | EU data protection |
| **WCAG 2.1 AA** | 📋 Planned | Accessibility |
| **ISO 27001** | 📋 Roadmap | Information security |

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Current)
- [x] Core architecture
- [x] Email/password auth
- [x] Basic identity registry
- [🚧] Platform type definitions

### Phase 2: Mobile Platforms
- [ ] Android Keystore adapter
- [ ] iOS Secure Enclave adapter
- [ ] Biometric APIs (fingerprint, face)
- [ ] FIDO2/WebAuthn implementation

### Phase 3: Desktop & Enterprise
- [ ] Windows TPM/Hello
- [ ] macOS Touch ID
- [ ] Linux FIDO2/U2F
- [ ] SmartCard/PKI

### Phase 4: IoT & Connectivity
- [ ] BLE pairing protocol
- [ ] NFC authentication
- [ ] QR code flows
- [ ] Device registry

### Phase 5: Blockchain & Web3
- [ ] MetaMask integration
- [ ] Solana wallet adapter
- [ ] WalletConnect protocol
- [ ] Hardware wallet support

### Phase 6: Government & KYC
- [ ] Diia.gov.ua integration
- [ ] ICAO passport scan
- [ ] eIDAS compliance
- [ ] Document verification

### Phase 7: Advanced Security
- [ ] Post-quantum cryptography
- [ ] E2EE messaging
- [ ] Airgap operations
- [ ] Remote device management

---

## 💡 Notes

**Legend:**
- ✅ Implemented
- 🚧 In Progress
- 📋 Planned
- 📋 Roadmap (future)

**No Russian Solutions:**
- GOST algorithms excluded
- No Yandex/Mail.ru/VK integrations
- Post-quantum: NIST standards only

**Open Source Priority:**
- Prefer open, auditable solutions
- No blackbox security modules
- Community-driven protocols

---

## 📞 Device-Specific Notes

### Vertu / Secure Phones
- Custom hardware encryption chips supported via Secure Element adapter
- VPN/firewall integration через network security module
- Device wipe/lost mode через remote management API

### Xiaomi / POCO
- Custom ROM detection
- MIUI biometric API compatibility
- SafetyNet attestation workarounds

### Huawei
- Huawei Mobile Services (HMS) support
- Safety Detect integration
- Alternative to Google Play Services

### Samsung
- Samsung Knox integration
- Iris scanner support
- Secure Folder compatibility

---

## 🔗 References

- [FIDO Alliance](https://fidoalliance.org/)
- [WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [Android Keystore](https://developer.android.com/training/articles/keystore)
- [Apple Secure Enclave](https://support.apple.com/guide/security/secure-enclave-sec59b0b31ff/web)
- [TPM 2.0 Specification](https://trustedcomputinggroup.org/resource/tpm-library-specification/)
- [WalletConnect](https://walletconnect.com/)
- [Diia API Documentation](https://diia.gov.ua/)

---

<div align="center">

**iQ-auth: Universal authentication from Bluetooth headphones to Vertu** 🔐

Made with ❤️ in Ukraine 🇺🇦

</div>
