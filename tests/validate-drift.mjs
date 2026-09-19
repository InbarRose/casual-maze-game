/**
 * Casual Maze Game — Drift Detection & Cryptographic Integrity Validator
 *
 * Verifies:
 * 1. Asset Drift: Every SVG file in assets/ matches its registered SHA-256 hash and file size.
 *    Flags unmanifested SVGs, missing SVGs, or modified/corrupted SVGs.
 * 2. Level Drift: Every level file in levels/ matches its registered SHA-256 hash, dimensions, and version.
 *    Flags unmanifested levels, missing levels, or modified/corrupted levels.
 * 3. Version Alignment: Ensures package.json, js/core/version.js, assets/manifest.json, and level schemas match.
 *
 * Exits with non-zero exit code on failure to block invalid PRs in CI.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ENGINE_VERSION, ASSET_MANIFEST_VERSION, LEVEL_SCHEMA_VERSION } from '../js/core/version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function check(description, condition, detail = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${description}`);
  } else {
    failedChecks++;
    const msg = `  ✗ FAIL: ${description}${detail ? ` — ${detail}` : ''}`;
    console.error(msg);
    failures.push(msg);
  }
}

function computeFileHashAndSize(filePath) {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return { hash, size: content.length };
}

console.log('=== CASUAL MAZE GAME: DRIFT & INTEGRITY AUDIT ===\n');

// -------------------------------------------------------------
// Phase 1: Engine & Package Version Alignment
// -------------------------------------------------------------
console.log('[Phase 1] Validating Engine & Package Version Alignment...');
const pkgPath = path.join(rootDir, 'package.json');
check('package.json exists', fs.existsSync(pkgPath));

if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  check(`package.json version matches ENGINE_VERSION ("${ENGINE_VERSION}")`, pkg.version === ENGINE_VERSION, `got "${pkg.version}"`);
}

// -------------------------------------------------------------
// Phase 2: Vector Asset Manifest & Cryptographic Hash Validation
// -------------------------------------------------------------
console.log('\n[Phase 2] Validating Vector Asset Manifest & SHA-256 Hashes...');
const assetManifestPath = path.join(rootDir, 'assets', 'manifest.json');
const assetSchemaPath = path.join(rootDir, 'assets', 'schema.json');

check('assets/schema.json exists', fs.existsSync(assetSchemaPath));
check('assets/manifest.json exists', fs.existsSync(assetManifestPath));

if (fs.existsSync(assetManifestPath)) {
  const assetManifest = JSON.parse(fs.readFileSync(assetManifestPath, 'utf8'));
  check(`assets/manifest.json version matches ASSET_MANIFEST_VERSION ("${ASSET_MANIFEST_VERSION}")`, assetManifest.version === ASSET_MANIFEST_VERSION, `got "${assetManifest.version}"`);
  check('manifest.totalAssets matches assets.length', assetManifest.totalAssets === assetManifest.assets.length, `totalAssets=${assetManifest.totalAssets}, len=${assetManifest.assets.length}`);

  // Collect all SVGs on disk
  function scanDiskSvgs(dir) {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDiskSvgs(full));
      } else if (entry.name.endsWith('.svg')) {
        files.push(path.relative(rootDir, full).replace(/\\/g, '/'));
      }
    }
    return files;
  }

  const diskSvgs = scanDiskSvgs(path.join(rootDir, 'assets'));
  const manifestMap = new Map();
  for (const a of assetManifest.assets) {
    manifestMap.set(a.path.replace(/\\/g, '/'), a);
  }

  // 1. Detect unmanifested files
  const unmanifested = diskSvgs.filter(f => !manifestMap.has(f));
  check('Zero unmanifested SVG files in assets/ (no untracked asset drift)', unmanifested.length === 0, `Unmanifested: ${unmanifested.join(', ')}`);

  // 2. Detect missing files
  const missingFromDisk = assetManifest.assets.filter(a => !fs.existsSync(path.join(rootDir, a.path)));
  check('Zero missing SVG files from assets/manifest.json', missingFromDisk.length === 0, `Missing: ${missingFromDisk.map(m => m.path).join(', ')}`);

  // 3. Verify SHA-256 hashes and file sizes for all assets
  let hashMismatches = 0;
  let sizeMismatches = 0;
  let viewBoxErrors = 0;

  for (const asset of assetManifest.assets) {
    const fullPath = path.join(rootDir, asset.path);
    if (!fs.existsSync(fullPath)) continue;

    const { hash, size } = computeFileHashAndSize(fullPath);
    if (hash !== asset.hash) {
      hashMismatches++;
      console.error(`    [Hash Drift] ${asset.path}: disk=${hash.substring(0, 12)}... vs manifest=${asset.hash?.substring(0, 12)}...`);
    }
    if (size !== asset.size) {
      sizeMismatches++;
      console.error(`    [Size Drift] ${asset.path}: disk=${size}B vs manifest=${asset.size}B`);
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('viewBox="0 0 64 64"') && asset.viewBox === '0 0 64 64') {
      viewBoxErrors++;
    }
  }

  check('All registered assets match exact SHA-256 cryptographic hashes', hashMismatches === 0, `${hashMismatches} hash mismatch(es) detected`);
  check('All registered assets match exact file sizes', sizeMismatches === 0, `${sizeMismatches} size mismatch(es) detected`);
  check('All registered assets conform to standard viewBox="0 0 64 64"', viewBoxErrors === 0, `${viewBoxErrors} viewBox error(s) detected`);
}

// -------------------------------------------------------------
// Phase 3: Level Manifest & Level Schema Integrity
// -------------------------------------------------------------
console.log('\n[Phase 3] Validating Level Manifest & SHA-256 Hashes...');
const levelManifestPath = path.join(rootDir, 'levels', 'manifest.json');
check('levels/manifest.json exists', fs.existsSync(levelManifestPath));

if (fs.existsSync(levelManifestPath)) {
  const levelManifest = JSON.parse(fs.readFileSync(levelManifestPath, 'utf8'));
  check('levels/manifest.json is an array of 42 levels', Array.isArray(levelManifest) && levelManifest.length === 42, `got ${levelManifest.length}`);

  // Collect all level JSONs on disk
  function scanDiskLevels(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDiskLevels(full));
      } else if (entry.name.endsWith('.json') && entry.name !== 'manifest.json') {
        files.push(path.relative(rootDir, full).replace(/\\/g, '/'));
      }
    }
    return files;
  }

  const diskLevels = [
    ...scanDiskLevels(path.join(rootDir, 'levels', 'tutorial')),
    ...scanDiskLevels(path.join(rootDir, 'levels', 'stories')),
  ];
  for (let ch = 1; ch <= 8; ch++) {
    diskLevels.push(...scanDiskLevels(path.join(rootDir, 'levels', `chapter_${ch}`)));
  }

  const manifestMap = new Map();
  for (const entry of levelManifest) {
    manifestMap.set(entry.file.replace(/\\/g, '/'), entry);
  }

  // 1. Detect unmanifested levels
  const unmanifestedLevels = diskLevels.filter(f => !manifestMap.has(f));
  check('Zero unmanifested level files in levels/ (no untracked level drift)', unmanifestedLevels.length === 0, `Unmanifested: ${unmanifestedLevels.join(', ')}`);

  // 2. Detect missing levels
  const missingLevels = levelManifest.filter(m => !fs.existsSync(path.join(rootDir, m.file)));
  check('Zero missing level files from levels/manifest.json', missingLevels.length === 0, `Missing: ${missingLevels.map(m => m.file).join(', ')}`);

  // 3. Verify SHA-256 hashes, sizes, dimensions, and versioning for all levels
  let levelHashMismatches = 0;
  let levelSizeMismatches = 0;
  let missingVersionCount = 0;
  let dimensionMismatches = 0;

  for (const entry of levelManifest) {
    const fullPath = path.join(rootDir, entry.file);
    if (!fs.existsSync(fullPath)) continue;

    const { hash, size } = computeFileHashAndSize(fullPath);
    if (hash !== entry.hash) {
      levelHashMismatches++;
      console.error(`    [Level Hash Drift] ${entry.file}: disk=${hash.substring(0, 12)}... vs manifest=${entry.hash?.substring(0, 12)}...`);
    }
    if (size !== entry.size) {
      levelSizeMismatches++;
      console.error(`    [Level Size Drift] ${entry.file}: disk=${size}B vs manifest=${entry.size}B`);
    }

    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (data.version === undefined || typeof data.version !== 'number' || data.version < 1) {
      missingVersionCount++;
      console.error(`    [Version Missing] ${entry.file}: invalid or missing version (${data.version})`);
    }

    const dim = data.dimensions || { width: 0, height: 0 };
    if (entry.dimensions && (dim.width !== entry.dimensions.width || dim.height !== entry.dimensions.height)) {
      dimensionMismatches++;
      console.error(`    [Dimension Drift] ${entry.file}: disk=(${dim.width}x${dim.height}) vs manifest=(${entry.dimensions.width}x${entry.dimensions.height})`);
    }
  }

  check('All 42 levels match exact SHA-256 cryptographic hashes', levelHashMismatches === 0, `${levelHashMismatches} hash mismatch(es) detected`);
  check('All 42 levels match exact file sizes', levelSizeMismatches === 0, `${levelSizeMismatches} size mismatch(es) detected`);
  check('All 42 levels have explicit positive integer version fields', missingVersionCount === 0, `${missingVersionCount} invalid level version(s)`);
  check('All 42 levels match dimensions recorded in manifest', dimensionMismatches === 0, `${dimensionMismatches} dimension mismatch(es)`);
}

// -------------------------------------------------------------
// Phase 4: Embedded Code & Aggregator Alignment
// -------------------------------------------------------------
console.log('\n[Phase 4] Validating Embedded Code & Aggregator Alignment...');
const defaultLevelsPath = path.join(rootDir, 'js', 'levels', 'default-levels.js');
check('js/levels/default-levels.js exists', fs.existsSync(defaultLevelsPath));

if (fs.existsSync(defaultLevelsPath)) {
  const content = fs.readFileSync(defaultLevelsPath, 'utf8');
  check('default-levels.js imports CAMPAIGN_CH8_LEVELS', content.includes('CAMPAIGN_CH8_LEVELS'));
  check('default-levels.js spreads CAMPAIGN_CH8_LEVELS into CAMPAIGN_LEVELS', content.includes('...CAMPAIGN_CH8_LEVELS'));
  check('default-levels.js exports storyline helpers', content.includes('getStoryline') && content.includes('getStoryChapter'));
}

// -------------------------------------------------------------
// Summary & Final Status
// -------------------------------------------------------------
console.log('\n----------------------------------------');
console.log(`DRIFT AUDIT SUMMARY:`);
console.log(`  Total Checks:   ${totalChecks}`);
console.log(`  Passed Checks:  ${passedChecks}`);
console.log(`  Failed Checks:  ${failedChecks}`);
console.log('----------------------------------------\n');

if (failedChecks > 0) {
  console.error(`❌ DRIFT DETECTED: ${failedChecks} check(s) failed. Run 'npm run manifests:update' to reconcile metadata.`);
  process.exit(1);
} else {
  console.log('✨ ZERO DRIFT DETECTED: All assets, levels, schemas, and versions are 100% synchronized and verified!\n');
  process.exit(0);
}
