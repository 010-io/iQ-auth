# @iq-auth/sdk

High-level SDK for iQ-auth framework.

## Installation

```bash
pnpm add @iq-auth/sdk
```

## Quick Start

```typescript
import { IQAuthSDK } from '@iq-auth/sdk';

const auth = new IQAuthSDK();

// Authenticate user
const result = await auth.authenticate('fido2', {
  challenge: '...',
  credential: '...',
});

if (result.success) {
  console.log('Authenticated:', result.userId);
}

// Register identity
await auth.registerIdentity({
  type: 'wallet',
  userId: 'user-123',
  provider: 'metamask',
  data: { address: '0x...' },
  verified: true,
});

// Get user identities
const identities = await auth.getUserIdentities('user-123');
```

## License

MIT © Igor Omelchenko (010io)
