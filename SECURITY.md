# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in iQ-auth, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email:
- **Email:** [security contact email - to be added]
- **Subject:** `[SECURITY] iQ-auth Vulnerability Report`

Include in your report:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity (critical issues prioritized)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Best Practices

### For Users

1. **Never commit secrets** - Use `.env` files (not committed to git)
2. **Rotate credentials** - Change API keys and secrets regularly
3. **Use HTTPS** - Always use secure connections in production
4. **Keep updated** - Use latest versions for security patches

### For Contributors

1. **No hardcoded secrets** - Use environment variables
2. **Validate inputs** - Sanitize all user inputs
3. **Use dependencies wisely** - Audit dependencies for vulnerabilities
4. **Follow least privilege** - Grant minimal required permissions

## Cryptographic Standards

iQ-auth uses:
- **Hashing:** SHA-256
- **Encryption:** AES-256-GCM (when applicable)
- **JWT:** RS256 or ES256 (asymmetric)
- **FIDO2:** WebAuthn standard

## Vulnerability Disclosure

We follow coordinated vulnerability disclosure:
1. Report received and acknowledged
2. Vulnerability confirmed and assessed
3. Fix developed and tested
4. Security advisory published
5. Patch released

## Security Updates

Security updates will be released as soon as possible:
- **Critical:** Within 24-48 hours
- **High:** Within 7 days
- **Medium:** Within 30 days
- **Low:** In next regular release

## Bug Bounty

Currently, we do not have a formal bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities and will publicly acknowledge contributions (with permission).

---

**Thank you for helping keep iQ-auth secure!** 🔐
