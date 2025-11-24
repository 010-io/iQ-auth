# Basic Authentication Example

Demonstrates basic usage of iQ-auth SDK for identity management.

## Setup

```bash
cd examples/basic-auth
pnpm install
```

## Run

```bash
pnpm start
```

## What This Example Shows

1. **SDK Initialization** - Creating an iQ-auth SDK instance
2. **Plugin Registration** - Loading and initializing FIDO2 plugin
3. **Identity Registration** - Creating multiple identities for a user:
   - Wallet identity (MetaMask)
   - Device identity (mobile app)
   - Social identity (LinkedIn)
4. **Identity Retrieval** - Fetching all identities for a user
5. **Identity Update** - Modifying identity properties
6. **Identity Deletion** - Removing an identity
7. **Cleanup** - Properly destroying SDK instance

## Output

You should see output similar to:

```
🚀 iQ-auth Basic Example

1️⃣ Initializing iQ-auth SDK...
✅ SDK initialized

2️⃣ Registering FIDO2 plugin...
✅ FIDO2 plugin registered

3️⃣ Registering user identities...
  ✓ Registered wallet identity: 1732456789000-abc123
  ✓ Registered device identity: 1732456789001-def456
  ✓ Registered social identity: 1732456789002-ghi789

4️⃣ Retrieving user identities...
  Found 3 identities:

  1. WALLET - metamask
     ID: 1732456789000-abc123
     Verified: ✅
     Data: {...}

  2. DEVICE - mobile-app
     ID: 1732456789001-def456
     Verified: ✅
     Data: {...}

  3. SOCIAL - linkedin
     ID: 1732456789002-ghi789
     Verified: ✅
     Data: {...}

5️⃣ Updating identity...
  ✓ Updated wallet identity verification: false

6️⃣ Getting single identity...
  ✓ Retrieved device identity: 1732456789001-def456
     Provider: mobile-app
     Verified: ✅

7️⃣ Deleting identity...
  ✅ Deleted social identity

8️⃣ Verifying deletion...
  Remaining identities: 2

9️⃣ Cleaning up...
  ✅ SDK destroyed

🎉 Example completed successfully!
```

## Next Steps

- Explore other examples in `examples/` directory
- Read the [API documentation](../../docs/api)
- Try implementing your own authentication plugin
