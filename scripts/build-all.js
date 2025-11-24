#!/usr/bin/env node

/**
 * Build all packages in dependency order
 */

const { execSync } = require('child_process');
const path = require('path');

const packages = [
  'packages/core',
  'packages/sdk',
  'packages/plugins/fido2',
  'packages/plugins/diia',
  'packages/plugins/blockchain',
  'packages/plugins/biometric',
  'packages/plugins/linkedin',
  'packages/plugins/wallet',
  'packages/ai-assistant',
  'packages/cli',
];

function build(packagePath) {
  const fullPath = path.join(process.cwd(), packagePath);
  console.log(`\n🔨 Building ${packagePath}...`);

  try {
    execSync('pnpm build', {
      cwd: fullPath,
      stdio: 'inherit',
    });
    console.log(`✅ ${packagePath} built successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to build ${packagePath}`);
    return false;
  }
}

function main() {
  console.log('🚀 Building all iQ-auth packages\n');

  const results = packages.map(pkg => ({
    package: pkg,
    success: build(pkg),
  }));

  console.log('\n📊 Build Summary:\n');

  results.forEach(({ package: pkg, success }) => {
    console.log(`  ${success ? '✅' : '❌'} ${pkg}`);
  });

  const failed = results.filter(r => !r.success);

  if (failed.length > 0) {
    console.log(`\n❌ ${failed.length} package(s) failed to build`);
    process.exit(1);
  } else {
    console.log('\n✅ All packages built successfully!');
  }
}

main();
