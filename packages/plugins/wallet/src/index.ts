import {
  IAuthPlugin,
  IAuthProvider,
  AuthResult,
  VerifyResult,
  AUTH_METHODS,
} from '@iq-auth/core';

/**
 * Wallet configuration
 */
export interface WalletConfig {
  chains?: ChainConfig[];
  walletTypes?: WalletType[];
}

/**
 * Chain configuration
 */
export interface ChainConfig {
  chainId: number;
  chainName: string;
  rpcUrl?: string;
  explorerUrl?: string;
}

/**
 * Supported wallet types
 */
export type WalletType =
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'
  | 'ledger'
  | 'trezor'
  | 'solana'
  | 'phantom'
  | 'other';

/**
 * Wallet connection data
 */
export interface WalletConnection {
  address: string;
  chainId: number;
  walletType: WalletType;
  publicKey?: string;
}

/**
 * Wallet signature request
 */
export interface SignatureRequest {
  address: string;
  message: string;
  chainId?: number;
}

/**
 * Wallet Provider
 */
export class WalletProvider implements IAuthProvider {
  readonly name = 'wallet';
  readonly type = AUTH_METHODS.WALLET;

  private walletConfig: WalletConfig;
  private connections: Map<string, WalletConnection> = new Map();

  constructor(config: WalletConfig = {}) {
    this.walletConfig = config;
  }

  /**
   * Check if MetaMask is available
   */
  isMetaMaskAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof (window as any).ethereum !== 'undefined' &&
      (window as any).ethereum.isMetaMask === true
    );
  }

  /**
   * Check if Phantom (Solana) is available
   */
  isPhantomAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof (window as any).solana !== 'undefined' &&
      (window as any).solana.isPhantom === true
    );
  }

  /**
   * Connect MetaMask wallet
   */
  async connectMetaMask(): Promise<WalletConnection> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const ethereum = (window as any).ethereum;

      // Request accounts
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get chain ID
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      });

      const connection: WalletConnection = {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        walletType: 'metamask',
      };

      this.connections.set(connection.address, connection);

      return connection;
    } catch (error) {
      throw new Error(
        `MetaMask connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Connect Phantom (Solana) wallet
   */
  async connectPhantom(): Promise<WalletConnection> {
    if (!this.isPhantomAvailable()) {
      throw new Error('Phantom wallet is not installed');
    }

    try {
      const solana = (window as any).solana;

      const response = await solana.connect();
      const publicKey = response.publicKey.toString();

      const connection: WalletConnection = {
        address: publicKey,
        chainId: 0, // Solana doesn't use EVM chain IDs
        walletType: 'phantom',
        publicKey,
      };

      this.connections.set(connection.address, connection);

      return connection;
    } catch (error) {
      throw new Error(
        `Phantom connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sign message with wallet
   */
  async signMessage(request: SignatureRequest): Promise<string> {
    const connection = this.connections.get(request.address);

    if (!connection) {
      throw new Error('Wallet not connected');
    }

    try {
      if (connection.walletType === 'metamask') {
        return await this.signWithMetaMask(request);
      } else if (connection.walletType === 'phantom') {
        return await this.signWithPhantom(request);
      } else {
        throw new Error(`Unsupported wallet type: ${connection.walletType}`);
      }
    } catch (error) {
      throw new Error(
        `Signature failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Authenticate with wallet signature
   */
  async authenticate(credentials: unknown): Promise<AuthResult> {
    try {
      const { address, message, signature } = credentials as {
        address: string;
        message: string;
        signature: string;
      };

      if (!address || !message || !signature) {
        return {
          success: false,
          error: 'Address, message, and signature are required',
        };
      }

      // Verify signature
      const valid = await this.verifySignature(address, message, signature);

      if (!valid) {
        return {
          success: false,
          error: 'Invalid signature',
        };
      }

      // Generate session token
      const token = this.generateToken(address);

      return {
        success: true,
        userId: address, // Use wallet address as user ID
        token,
        metadata: {
          address,
          walletType: this.connections.get(address)?.walletType,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Verify authentication token
   */
  async verify(token: string): Promise<VerifyResult> {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [address, timestamp, signature] = parts;

      // Verify signature
      const expectedSignature = this.signToken(address, timestamp);
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid token signature' };
      }

      // Check expiration (24 hours)
      const tokenTime = parseInt(timestamp, 10);
      const expiresAt = new Date(tokenTime + 24 * 60 * 60 * 1000);

      if (Date.now() > expiresAt.getTime()) {
        return { valid: false, error: 'Token expired' };
      }

      return {
        valid: true,
        userId: address,
        expiresAt,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Token verification failed',
      };
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(address: string): Promise<boolean> {
    return this.connections.delete(address);
  }

  // Private helper methods

  private async signWithMetaMask(request: SignatureRequest): Promise<string> {
    const ethereum = (window as any).ethereum;

    const signature = await ethereum.request({
      method: 'personal_sign',
      params: [request.message, request.address],
    });

    return signature;
  }

  private async signWithPhantom(request: SignatureRequest): Promise<string> {
    const solana = (window as any).solana;

    const encodedMessage = new TextEncoder().encode(request.message);
    const signedMessage = await solana.signMessage(encodedMessage, 'utf8');

    return Buffer.from(signedMessage.signature).toString('hex');
  }

  private async verifySignature(
    _address: string,
    _message: string,
    _signature: string
  ): Promise<boolean> {
    // TODO: Implement actual signature verification
    // For EVM: use ethers.js or web3.js
    // For Solana: use @solana/web3.js
    // For now, accept as valid (placeholder)
    return true;
  }

  private generateToken(address: string): string {
    const timestamp = Date.now().toString();
    const signature = this.signToken(address, timestamp);
    return `${address}:${timestamp}:${signature}`;
  }

  private signToken(address: string, timestamp: string): string {
    const secret = process.env.JWT_SECRET || 'change-this-in-production';
    const data = `${address}:${timestamp}:${secret}`;
    // Simple hash (in production, use proper HMAC)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Wallet Plugin
 */
export class WalletPlugin implements IAuthPlugin {
  readonly name = 'wallet';
  readonly version = '0.1.0';

  provider: WalletProvider;

  constructor(config?: WalletConfig) {
    this.provider = new WalletProvider(config);
  }

  async initialize(config: Record<string, unknown>): Promise<void> {
    if (config.chains || config.walletTypes) {
      this.provider = new WalletProvider(config as WalletConfig);
    }
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
  }
}
