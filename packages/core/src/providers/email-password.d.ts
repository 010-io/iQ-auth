/**
 * Email/Password Authentication Provider
 *
 * Fallback authentication method using email and password
 */
import { IAuthProvider, AuthResult, VerifyResult } from '../types';
export interface EmailPasswordCredentials {
    email: string;
    password: string;
}
export interface EmailPasswordConfig {
    passwordMinLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    saltRounds?: number;
}
export declare class EmailPasswordProvider implements IAuthProvider {
    readonly name = "email-password";
    readonly type = "password";
    private config;
    private users;
    constructor(config?: EmailPasswordConfig);
    /**
     * Register new user
     */
    register(email: string, password: string, userId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Authenticate user
     */
    authenticate(credentials: unknown): Promise<AuthResult>;
    /**
     * Verify token
     */
    verify(token: string): Promise<VerifyResult>;
    /**
     * Change password
     */
    changePassword(email: string, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Delete user
     */
    deleteUser(email: string): Promise<boolean>;
    private isValidEmail;
    private validatePassword;
    private generateSalt;
    private hashPassword;
    private generateToken;
    private signToken;
}
//# sourceMappingURL=email-password.d.ts.map