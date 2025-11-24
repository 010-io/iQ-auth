/**
 * iQ-auth Core Constants
 * 
 * CREATOR_SEED: Unique identifier for the project creator
 * VERSION_SEED: Auto-generated version identifier based on cryptographic chain
 */

export const CREATOR_SEED = process.env.CREATOR_SEED || '010io-iq-auth';

export const VERSION_SEED = process.env.VERSION_SEED || 'auto';

export const SYSTEM_NAME = 'iQ-auth';

export const SYSTEM_VERSION = '0.1.0';

/**
 * Supported authentication methods
 */
export const AUTH_METHODS = {
  FIDO2: 'fido2',
  BIOMETRIC: 'biometric',
  BLOCKCHAIN: 'blockchain',
  WALLET: 'wallet',
  GOVERNMENT: 'government',
  SOCIAL: 'social',
  PASSWORD: 'password',
  DEVICE: 'device',
} as const;

/**
 * Identity types supported by the multi-ID registry
 */
export const IDENTITY_TYPES = {
  DEVICE: 'device',
  BIOMETRIC: 'biometric',
  SOCIAL: 'social',
  WALLET: 'wallet',
  GOVERNMENT: 'government',
} as const;
