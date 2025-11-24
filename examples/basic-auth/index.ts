/**
 * Basic iQ-auth Usage Example
 * 
 * Demonstrates:
 * - SDK initialization
 * - Plugin registration
 * - Identity management
 */

import { IQAuthSDK } from '@iq-auth/sdk';
import { FIDO2Plugin } from '@iq-auth/plugin-fido2';

async function main() {
  console.log('🚀 iQ-auth Basic Example\n');

  // 1. Initialize SDK
  console.log('1️⃣ Initializing iQ-auth SDK...');
  const auth = new IQAuthSDK();
  console.log('✅ SDK initialized\n');

  // 2. Register FIDO2 plugin
  console.log('2️⃣ Registering FIDO2 plugin...');
  const fido2Plugin = new FIDO2Plugin();
  await auth.engine.plugins.register(fido2Plugin);
  await auth.engine.plugins.initialize('fido2', {
    rpName: 'iQ-auth Demo',
    rpId: 'localhost',
    origin: 'http://localhost:3000',
  });
  console.log('✅ FIDO2 plugin registered\n');

  // 3. Register user identities
  console.log('3️⃣ Registering user identities...');

  const walletIdentity = await auth.registerIdentity({
    type: 'wallet',
    userId: 'user-123',
    provider: 'metamask',
    data: {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      chainId: 1,
    },
    verified: true,
  });
  console.log('  ✓ Registered wallet identity:', walletIdentity.id);

  const deviceIdentity = await auth.registerIdentity({
    type: 'device',
    userId: 'user-123',
    provider: 'mobile-app',
    data: {
      deviceId: 'device-456',
      platform: 'iOS',
      model: 'iPhone 15 Pro',
    },
    verified: true,
  });
  console.log('  ✓ Registered device identity:', deviceIdentity.id);

  const socialIdentity = await auth.registerIdentity({
    type: 'social',
    userId: 'user-123',
    provider: 'linkedin',
    data: {
      linkedinId: 'igor-omelchenko',
      verified: true,
    },
    verified: true,
  });
  console.log('  ✓ Registered social identity:', socialIdentity.id);

  console.log('\n');

  // 4. Retrieve all user identities
  console.log('4️⃣ Retrieving user identities...');
  const identities = await auth.getUserIdentities('user-123');
  console.log(`  Found ${identities.length} identities:\n`);

  identities.forEach((identity, index) => {
    console.log(`  ${index + 1}. ${identity.type.toUpperCase()} - ${identity.provider}`);
    console.log(`     ID: ${identity.id}`);
    console.log(`     Verified: ${identity.verified ? '✅' : '❌'}`);
    console.log(`     Data:`, JSON.stringify(identity.data, null, 6).slice(0, 100) + '...');
    console.log('');
  });

  // 5. Update identity
  console.log('5️⃣ Updating identity...');
  const updated = await auth.updateIdentity(walletIdentity.id, {
    verified: false, // Revoke verification for demonstration
  });
  console.log(`  ✓ Updated wallet identity verification: ${updated.verified}\n`);

  // 6. Get single identity
  console.log('6️⃣ Getting single identity...');
  const retrieved = await auth.getIdentity(deviceIdentity.id);
  if (retrieved) {
    console.log(`  ✓ Retrieved device identity: ${retrieved.id}`);
    console.log(`     Provider: ${retrieved.provider}`);
    console.log(`     Verified: ${retrieved.verified}\n`);
  }

  // 7. Delete identity
  console.log('7️⃣ Deleting identity...');
  const deleted = await auth.deleteIdentity(socialIdentity.id);
  console.log(`  ${deleted ? '✅' : '❌'} Deleted social identity\n`);

  // 8. Verify deletion
  console.log('8️⃣ Verifying deletion...');
  const remaining = await auth.getUserIdentities('user-123');
  console.log(`  Remaining identities: ${remaining.length}\n`);

  // 9. Cleanup
  console.log('9️⃣ Cleaning up...');
  await auth.destroy();
  console.log('  ✅ SDK destroyed\n');

  console.log('🎉 Example completed successfully!\n');
}

// Run example
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
