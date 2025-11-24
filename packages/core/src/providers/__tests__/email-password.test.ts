/**
 * EmailPasswordProvider Unit Tests
 */

import { EmailPasswordProvider } from '../email-password';

describe('EmailPasswordProvider', () => {
  let provider: EmailPasswordProvider;

  beforeEach(() => {
    provider = new EmailPasswordProvider({
      passwordMinLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    });
  });

  describe('register', () => {
    it('should register user with valid credentials', async () => {
      const result = await provider.register(
        'test@example.com',
        'Test1234',
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid email', async () => {
      const result = await provider.register(
        'invalid-email',
        'Test1234',
        'user-123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject short password', async () => {
      const result = await provider.register(
        'test@example.com',
        'Test12',
        'user-123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reject password without uppercase', async () => {
      const result = await provider.register(
        'test@example.com',
        'test1234',
        'user-123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('uppercase letter');
    });

    it('should reject password without lowercase', async () => {
      const result = await provider.register(
        'test@example.com',
        'TEST1234',
        'user-123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('lowercase letter');
    });

    it('should reject password without numbers', async () => {
      const result = await provider.register(
        'test@example.com',
        'TestTest',
        'user-123'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('number');
    });

    it('should reject duplicate email', async () => {
      await provider.register('test@example.com', 'Test1234', 'user-123');

      const result = await provider.register(
        'test@example.com',
        'Test5678',
        'user-456'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });

    it('should handle email case-insensitively', async () => {
      await provider.register('Test@Example.com', 'Test1234', 'user-123');

      const result = await provider.register(
        'test@example.com',
        'Test5678',
        'user-456'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });
  });

  describe('authenticate', () => {
    beforeEach(async () => {
      await provider.register('test@example.com', 'Test1234', 'user-123');
    });

    it('should authenticate with correct credentials', async () => {
      const result = await provider.authenticate({
        email: 'test@example.com',
        password: 'Test1234',
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-123');
      expect(result.token).toBeDefined();
      expect(result.metadata?.email).toBe('test@example.com');
    });

    it('should reject wrong password', async () => {
      const result = await provider.authenticate({
        email: 'test@example.com',
        password: 'WrongPassword1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      const result = await provider.authenticate({
        email: 'notfound@example.com',
        password: 'Test1234',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should require email and password', async () => {
      const result1 = await provider.authenticate({
        email: 'test@example.com',
      });

      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Email and password are required');

      const result2 = await provider.authenticate({
        password: 'Test1234',
      });

      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Email and password are required');
    });

    it('should handle email case-insensitively', async () => {
      const result = await provider.authenticate({
        email: 'TEST@EXAMPLE.COM',
        password: 'Test1234',
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-123');
    });
  });

  describe('verify', () => {
    it('should verify valid token', async () => {
      await provider.register('test@example.com', 'Test1234', 'user-123');

      const authResult = await provider.authenticate({
        email: 'test@example.com',
        password: 'Test1234',
      });

      const verifyResult = await provider.verify(authResult.token!);

      expect(verifyResult.valid).toBe(true);
      expect(verifyResult.userId).toBe('user-123');
      expect(verifyResult.expiresAt).toBeInstanceOf(Date);
    });

    it('should reject invalid token format', async () => {
      const result = await provider.verify('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token format');
    });

    it('should reject token with invalid signature', async () => {
      const result = await provider.verify('user-123:1234567890:invalid');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token signature');
    });
  });

  describe('changePassword', () => {
    beforeEach(async () => {
      await provider.register('test@example.com', 'OldPassword1', 'user-123');
    });

    it('should change password with valid credentials', async () => {
      const result = await provider.changePassword(
        'test@example.com',
        'OldPassword1',
        'NewPassword2'
      );

      expect(result.success).toBe(true);

      // Verify old password no longer works
      const authOld = await provider.authenticate({
        email: 'test@example.com',
        password: 'OldPassword1',
      });
      expect(authOld.success).toBe(false);

      // Verify new password works
      const authNew = await provider.authenticate({
        email: 'test@example.com',
        password: 'NewPassword2',
      });
      expect(authNew.success).toBe(true);
    });

    it('should reject wrong current password', async () => {
      const result = await provider.changePassword(
        'test@example.com',
        'WrongPassword1',
        'NewPassword2'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid current password');
    });

    it('should validate new password', async () => {
      const result = await provider.changePassword(
        'test@example.com',
        'OldPassword1',
        'weak'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reject for non-existent user', async () => {
      const result = await provider.changePassword(
        'notfound@example.com',
        'OldPassword1',
        'NewPassword2'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('deleteUser', () => {
    beforeEach(async () => {
      await provider.register('test@example.com', 'Test1234', 'user-123');
    });

    it('should delete user', async () => {
      const deleted = await provider.deleteUser('test@example.com');

      expect(deleted).toBe(true);

      // Verify user can no longer authenticate
      const authResult = await provider.authenticate({
        email: 'test@example.com',
        password: 'Test1234',
      });

      expect(authResult.success).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      const deleted = await provider.deleteUser('notfound@example.com');

      expect(deleted).toBe(false);
    });
  });
});
