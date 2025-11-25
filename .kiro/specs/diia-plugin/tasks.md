# Implementation Plan: Diia.gov.ua Authentication Plugin

## Overview

This implementation plan transforms the Diia plugin design into actionable development tasks. Each task builds incrementally on previous work, with property-based tests integrated close to implementation to catch errors early.

---

## Tasks

- [ ] 1. Set up plugin package structure and core interfaces
  - Create `packages/plugins/diia/` directory structure
  - Set up package.json with dependencies (jose, qrcode, fast-check)
  - Create tsconfig.build.json for TypeScript compilation
  - Define core TypeScript interfaces (DiiaPluginConfig, DiiaAuthOptions, DiiaAuthResult)
  - Create index.ts with exports
  - _Requirements: 5.1, 9.1_

- [ ] 2. Implement OAuth Client component
  - [ ] 2.1 Create OAuthClient class with PKCE support
    - Implement generateAuthorizationUrl() with PKCE code challenge
    - Implement exchangeCodeForTokens() for token exchange
    - Implement refreshAccessToken() for token refresh
    - Add HTTPS validation for all API endpoints
    - _Requirements: 1.1, 1.2, 6.4, 8.1_

  - [ ] 2.2 Write property test for authorization URL generation
    - **Property 1: Authorization URL contains required OAuth parameters**
    - **Validates: Requirements 1.1**

  - [ ] 2.3 Write property test for state parameter uniqueness
    - **Property 2: State parameter uniqueness**
    - **Validates: Requirements 6.1**

  - [ ] 2.4 Write property test for HTTPS enforcement
    - **Property 16: HTTPS enforced for API calls**
    - **Validates: Requirements 6.4**

  - [ ] 2.5 Implement ID token validation using jose library
    - Parse and validate JWT structure
    - Verify signature using Diia's public key
    - Extract identity claims (sub, email, name, phone)
    - _Requirements: 1.3_

  - [ ] 2.6 Write property test for ID token parsing
    - **Property 5: ID token parsing extracts identity**
    - **Validates: Requirements 1.3**

  - [ ] 2.7 Write unit tests for OAuth client
    - Test PKCE code generation and verification
    - Test token exchange with mocked API responses
    - Test error handling for invalid responses
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement state management and CSRF protection
  - [ ] 3.1 Create state generation and verification logic
    - Generate cryptographically random state parameters
    - Store pending states with expiration (5 minutes)
    - Implement state verification on callback
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 3.2 Write property test for state verification
    - **Property 3: State verification prevents CSRF**
    - **Validates: Requirements 6.2, 6.3**

  - [ ] 3.3 Write unit tests for CSRF protection
    - Test state mismatch rejection
    - Test expired state handling
    - Test state cleanup after use
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 4. Implement Token Manager component
  - [ ] 4.1 Create TokenManager class
    - Implement storeSession() to save tokens with expiration
    - Implement getSession() to retrieve active sessions
    - Implement refreshSession() to refresh expired tokens
    - Implement invalidateSession() to clear sessions
    - Add isExpired() helper for expiration checks
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 4.2 Write property test for token refresh
    - **Property 18: Token refresh updates stored tokens**
    - **Validates: Requirements 8.2**

  - [ ] 4.3 Write property test for failed refresh
    - **Property 19: Failed refresh invalidates session**
    - **Validates: Requirements 8.3**

  - [ ] 4.4 Write unit tests for token manager
    - Test session storage and retrieval
    - Test token expiration logic
    - Test session invalidation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 5. Implement Document Verifier component
  - [ ] 5.1 Create DocumentVerifier class
    - Implement verifySignature() using cryptographic verification
    - Implement isExpired() for document expiration checks
    - Implement extractClaims() to parse document data
    - Embed Diia's public key for signature verification
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ] 5.2 Write property test for valid signatures
    - **Property 10: Valid signatures pass verification**
    - **Validates: Requirements 4.1**

  - [ ] 5.3 Write property test for invalid signatures
    - **Property 11: Invalid signatures fail verification**
    - **Validates: Requirements 4.4**

  - [ ] 5.4 Write property test for expired documents
    - **Property 12: Expired documents are rejected**
    - **Validates: Requirements 4.5**

  - [ ] 5.5 Write unit tests for document verifier
    - Test signature verification with valid/invalid signatures
    - Test expiration date validation
    - Test claim extraction from various document types
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [ ] 6. Implement QR Code Generator component
  - [ ] 6.1 Create QRCodeGenerator class
    - Implement generate() to create QR code as Buffer
    - Implement generateDataURL() for base64 data URLs
    - Add configurable options (size, error correction, margin)
    - Use qrcode library for generation
    - _Requirements: 2.1, 2.2_

  - [ ] 6.2 Write property test for QR code round-trip
    - **Property 8: QR code round-trip preserves URL**
    - **Validates: Requirements 2.2**

  - [ ] 6.3 Write unit tests for QR code generator
    - Test QR code generation with various URLs
    - Test data URL format
    - Test configuration options
    - _Requirements: 2.1, 2.2_

- [ ] 7. Implement DiiaProvider authentication provider
  - [ ] 7.1 Create DiiaProvider class implementing IAuthProvider
    - Implement authenticate() method for OAuth flow initiation
    - Implement handleCallback() for authorization code processing
    - Implement verify() for session token validation
    - Implement refresh() for token refresh
    - Integrate OAuthClient, TokenManager, DocumentVerifier
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.3, 9.4_

  - [ ]* 7.2 Write property test for token exchange
    - **Property 4: Token exchange produces valid tokens**
    - **Validates: Requirements 1.2**

  - [ ]* 7.3 Write property test for identity registration
    - **Property 6: Successful authentication registers identity**
    - **Validates: Requirements 1.4**

  - [ ]* 7.4 Write property test for authentication failures
    - **Property 7: Authentication failures return error results**
    - **Validates: Requirements 1.5, 7.1, 7.2, 7.3, 7.4, 7.5**

  - [ ] 7.2 Implement document scope handling
    - Accept document scopes in authentication options
    - Include scopes in authorization URL
    - Fetch document data after authentication
    - Verify document signatures before storing
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 7.6 Write property test for document scopes
    - **Property 9: Document scopes included in authorization**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 7.7 Write property test for verified identity marking
    - **Property 13: Valid documents mark identity as verified**
    - **Validates: Requirements 4.3**

  - [ ] 7.8 Implement QR code authentication flow
    - Generate deep link URL with state
    - Create QR code from deep link
    - Handle callback from mobile app
    - Complete token exchange
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [ ]* 7.9 Write unit tests for DiiaProvider
    - Test full authentication flow with mocked API
    - Test QR code authentication flow
    - Test document retrieval and verification
    - Test error scenarios (network, invalid code, denied)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.4, 2.5, 3.1, 3.2, 3.3_

- [ ] 8. Implement error handling and logging
  - [ ] 8.1 Create DiiaError class and error codes
    - Define DiiaErrorCode enum with all error types
    - Create DiiaError class extending Error
    - Implement error mapping from Diia API errors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 8.2 Implement logging with sensitive data redaction
    - Create logger utility with redaction logic
    - Log authentication attempts with user identifiers
    - Log API calls with metadata (no tokens/secrets)
    - Log errors with stack traces
    - Log security events with elevated severity
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 8.3 Write property test for token redaction
    - **Property 17: Tokens never appear in logs or errors**
    - **Validates: Requirements 6.5, 10.5**

  - [ ]* 8.4 Write property test for API call logging
    - **Property 23: API calls logged without sensitive data**
    - **Validates: Requirements 10.2**

  - [ ]* 8.5 Write unit tests for error handling
    - Test error mapping for all Diia API error codes
    - Test network error handling
    - Test user cancellation handling
    - Test rate limit handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 8.6 Write unit tests for logging
    - Test authentication attempt logging
    - Test sensitive data redaction
    - Test security event logging
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9. Implement DiiaPlugin wrapper
  - [ ] 9.1 Create DiiaPlugin class implementing IAuthPlugin
    - Implement initialize() with configuration validation
    - Implement destroy() with credential cleanup
    - Register DiiaProvider with authentication engine
    - Store configuration securely in memory
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2_

  - [ ]* 9.2 Write property test for configuration validation
    - **Property 14: Configuration validation rejects missing parameters**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 9.3 Write property test for plugin cleanup
    - **Property 15: Plugin cleanup clears credentials**
    - **Validates: Requirements 5.5**

  - [ ]* 9.4 Write property test for AuthResult format
    - **Property 20: AuthResult format compliance**
    - **Validates: Requirements 9.3**

  - [ ]* 9.5 Write property test for VerifyResult format
    - **Property 21: VerifyResult format compliance**
    - **Validates: Requirements 9.4**

  - [ ]* 9.6 Write unit tests for DiiaPlugin
    - Test plugin initialization with valid/invalid config
    - Test provider registration
    - Test plugin destruction and cleanup
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2, 9.5_

- [ ] 10. Implement Identity Registry integration
  - [ ] 10.1 Create identity registration logic
    - Register government identity after successful authentication
    - Store Diia user ID, email, phone, name in identity data
    - Store document data in identity metadata
    - Mark identity as verified when documents are valid
    - _Requirements: 1.4, 3.5, 4.3_

  - [ ]* 10.2 Write property test for authentication logging
    - **Property 22: Authentication attempts are logged**
    - **Validates: Requirements 10.1**

  - [ ]* 10.3 Write integration tests for registry
    - Test identity registration after authentication
    - Test identity retrieval by user ID
    - Test verified flag setting
    - Test document data storage
    - _Requirements: 1.4, 3.5, 4.3_

- [ ] 11. Create configuration and documentation
  - [ ] 11.1 Create README.md for the plugin
    - Document installation instructions
    - Provide usage examples (basic auth, QR code, documents)
    - Document configuration options
    - List supported document types and scopes
    - Add troubleshooting section
    - _Requirements: All_

  - [ ] 11.2 Create TypeScript type definitions
    - Export all public interfaces and types
    - Add JSDoc comments for all public APIs
    - Generate .d.ts files during build
    - _Requirements: All_

  - [ ] 11.3 Create example application
    - Create example in `examples/diia-auth/`
    - Demonstrate basic authentication flow
    - Demonstrate QR code authentication
    - Demonstrate document verification
    - Add README with setup instructions
    - _Requirements: 1.1, 2.1, 3.1_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify 100% pass rate
  - Run all property-based tests with 100+ iterations
  - Run integration tests with mocked Diia API
  - Verify test coverage >85%
  - Fix any failing tests or implementation bugs
  - Ask the user if questions arise

- [ ] 13. Security audit and hardening
  - [ ] 13.1 Review security implementation
    - Verify PKCE implementation correctness
    - Verify state parameter CSRF protection
    - Verify HTTPS enforcement for all API calls
    - Verify token storage security (memory only)
    - Verify sensitive data redaction in logs
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 13.2 Add security documentation
    - Document security features in README
    - Add SECURITY.md with vulnerability reporting
    - Document threat model and mitigations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 14. Performance optimization
  - [ ] 14.1 Implement caching and optimization
    - Cache access tokens until expiration
    - Implement connection pooling for API calls
    - Add configurable timeout handling
    - Optimize QR code generation (async)
    - _Requirements: All_

  - [ ]* 14.2 Write performance tests
    - Test token caching effectiveness
    - Test concurrent authentication requests
    - Test QR code generation performance
    - _Requirements: All_

- [ ] 15. Final integration and testing
  - [ ] 15.1 Integration with iQ-auth core
    - Test plugin registration with IQAuth instance
    - Test authentication through SDK
    - Test identity retrieval from registry
    - Test plugin lifecycle (init, auth, destroy)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 15.2 End-to-end integration tests
    - Test full OAuth flow with sandbox Diia API
    - Test QR code flow with sandbox
    - Test document verification with sandbox
    - Test error scenarios with sandbox
    - _Requirements: All_

- [ ] 16. Final Checkpoint - Production readiness
  - Verify all tests pass (unit, property, integration, e2e)
  - Verify test coverage >85%
  - Verify documentation completeness
  - Verify example application works
  - Verify security audit complete
  - Run lint and type checking
  - Ensure all tests pass, ask the user if questions arise

---

## Task Execution Notes

### Testing Strategy
- **Unit tests**: Test individual components in isolation
- **Property-based tests**: Verify universal properties with 100+ random inputs using fast-check
- **Integration tests**: Test component interactions with mocked dependencies
- **E2E tests**: Test full flows with Diia sandbox API

### Property Test Tagging
All property-based tests must include a comment tag:
```typescript
// Feature: diia-plugin, Property {number}: {property_text}
```

### Optional Tasks
Tasks marked with `*` are optional and focus on testing infrastructure. They can be skipped for faster MVP delivery but are recommended for production quality.

### Dependencies
- **jose**: ^5.0.0 - JWT parsing and validation
- **qrcode**: ^1.5.0 - QR code generation
- **fast-check**: ^3.15.0 - Property-based testing (devDependency)
- **@iq-auth/core**: workspace:* - Core interfaces and registry

### Acceptance Criteria
Each task is complete when:
1. Code is implemented and follows TypeScript best practices
2. All related tests pass
3. Code is documented with JSDoc comments
4. No TypeScript errors or warnings
5. Code is committed to version control

### Traceability
Each task references specific requirements from requirements.md using the format:
- _Requirements: X.Y, Z.W_

This ensures full traceability from requirements → design → implementation.
