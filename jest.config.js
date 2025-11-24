module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/**/src/**/*.d.ts',
    '!packages/**/src/**/*.test.ts',
    '!packages/**/src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  moduleNameMapper: {
    '^@iq-auth/core$': '<rootDir>/packages/core/src',
    '^@iq-auth/sdk$': '<rootDir>/packages/sdk/src',
    '^@iq-auth/cli$': '<rootDir>/packages/cli/src',
    '^@iq-auth/ai$': '<rootDir>/packages/ai-assistant/src',
    '^@iq-auth/plugin-fido2$': '<rootDir>/packages/plugins/fido2/src',
    '^@iq-auth/plugin-diia$': '<rootDir>/packages/plugins/diia/src',
    '^@iq-auth/plugin-blockchain$':
      '<rootDir>/packages/plugins/blockchain/src',
    '^@iq-auth/plugin-biometric$': '<rootDir>/packages/plugins/biometric/src',
    '^@iq-auth/plugin-linkedin$': '<rootDir>/packages/plugins/linkedin/src',
    '^@iq-auth/plugin-wallet$': '<rootDir>/packages/plugins/wallet/src',
  },
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
};
