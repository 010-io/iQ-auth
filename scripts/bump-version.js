#!/usr/bin/env node

/**
 * Auto-versioning script for iQ-auth
 * Uses CREATOR_SEED and VERSION_SEED for version generation
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CREATOR_SEED = process.env.CREATOR_SEED || '010io-iq-auth';

/**
 * Generate new version based on current timestamp and creator seed
 */
function generateVersion() {
  const timestamp = Date.now();
  const hash = crypto
    .createHash('sha256')
    .update(`${CREATOR_SEED}-${timestamp}`)
    .digest('hex')
    .substring(0, 8);

  const major = 0;
  const minor = Math.floor(timestamp / 1000000) % 100;
  const patch = Math.floor(timestamp / 1000) % 1000;

  return {
    semver: `${major}.${minor}.${patch}`,
    seed: hash,
    timestamp,
  };
}

/**
 * Update package.json version
 */
function updatePackageVersion(packagePath, version) {
  const pkgJsonPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  pkg.version = version;

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');

  return true;
}

/**
 * Find all packages in workspace
 */
function findWorkspacePackages() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = [];

  // Core packages
  const corePackages = ['core', 'sdk', 'cli', 'ai-assistant'];
  corePackages.forEach(name => {
    const pkgPath = path.join(packagesDir, name);
    if (fs.existsSync(pkgPath)) {
      packages.push({ name: `@iq-auth/${name}`, path: pkgPath });
    }
  });

  // Plugin packages
  const pluginsDir = path.join(packagesDir, 'plugins');
  if (fs.existsSync(pluginsDir)) {
    const pluginNames = fs.readdirSync(pluginsDir);
    pluginNames.forEach(name => {
      const pkgPath = path.join(pluginsDir, name);
      if (fs.statSync(pkgPath).isDirectory()) {
        packages.push({ name: `@iq-auth/plugin-${name}`, path: pkgPath });
      }
    });
  }

  return packages;
}

/**
 * Update CHANGELOG
 */
function updateChangelog(version, versionInfo) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];

  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }

  const newEntry = `## [${version}] - ${date}\n\n`
    + `**Version Seed:** ${versionInfo.seed}\n`
    + `**Timestamp:** ${versionInfo.timestamp}\n\n`
    + `### Added\n- Auto-generated version bump\n\n`;

  // Insert after header
  const lines = changelog.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## '));
  if (insertIndex === -1) {
    changelog += '\n' + newEntry;
  } else {
    lines.splice(insertIndex, 0, newEntry);
    changelog = lines.join('\n');
  }

  fs.writeFileSync(changelogPath, changelog);
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 iQ-auth Auto-Versioning\n');

  const versionInfo = generateVersion();
  const version = versionInfo.semver;

  console.log(`📦 New version: ${version}`);
  console.log(`🔑 Version seed: ${versionInfo.seed}`);
  console.log(`⏰ Timestamp: ${versionInfo.timestamp}\n`);

  // Update root package.json
  console.log('Updating root package.json...');
  updatePackageVersion(process.cwd(), version);

  // Update workspace packages
  const packages = findWorkspacePackages();
  console.log(`\nUpdating ${packages.length} workspace packages:\n`);

  packages.forEach(pkg => {
    const updated = updatePackageVersion(pkg.path, version);
    if (updated) {
      console.log(`  ✓ ${pkg.name}`);
    } else {
      console.log(`  ✗ ${pkg.name} (not found)`);
    }
  });

  // Update CHANGELOG
  console.log('\nUpdating CHANGELOG.md...');
  updateChangelog(version, versionInfo);

  // Save VERSION_SEED to .env
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const versionSeedLine = `VERSION_SEED=${versionInfo.seed}\n`;
  if (envContent.includes('VERSION_SEED=')) {
    envContent = envContent.replace(/VERSION_SEED=.*/g, `VERSION_SEED=${versionInfo.seed}`);
  } else {
    envContent += versionSeedLine;
  }

  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Version bump complete!\n');
  console.log(`Next steps:`);
  console.log(`  1. Review changes: git diff`);
  console.log(`  2. Commit: git add -A && git commit -m "chore: bump version to ${version}"`);
  console.log(`  3. Tag: git tag v${version}`);
  console.log(`  4. Push: git push && git push --tags\n`);
}

main();
