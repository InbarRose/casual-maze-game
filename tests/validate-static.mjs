/**
 * Zero-Dependency Static File & Architecture Integrity Checker
 * Verifies critical static assets, manifest consistency, and ensures zero production runtime dependencies.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

console.log('=== CASUAL MAZE GAME: STATIC INTEGRITY CHECK ===\n');

let failed = false;

function check(desc, condition) {
  if (condition) {
    console.log(`  ✓ ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    failed = true;
  }
}

// 1. Critical Root Assets
console.log('[Phase 1] Checking Core Web Assets...');
check('CNAME exists for custom domain routing', existsSync(join(ROOT_DIR, 'CNAME')));
check('index.html exists (Hub / Level Select)', existsSync(join(ROOT_DIR, 'index.html')));
check('maze.html exists (Game Viewport)', existsSync(join(ROOT_DIR, 'maze.html')));
check('editor.html exists (Level Architect)', existsSync(join(ROOT_DIR, 'editor.html')));
check('package.json exists', existsSync(join(ROOT_DIR, 'package.json')));

// 2. Pure Static Dependency Rule
console.log('\n[Phase 2] Enforcing Pure Static (Zero Backend) Architecture...');
const pkg = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));
const hasProdDependencies = pkg.dependencies && Object.keys(pkg.dependencies).length > 0;
check('Zero production runtime dependencies in package.json', !hasProdDependencies);

// 3. Manifest & Level JSON Verification
console.log('\n[Phase 3] Checking Level Manifest & Files...');
const manifestPath = join(ROOT_DIR, 'levels', 'manifest.json');
check('levels/manifest.json exists', existsSync(manifestPath));

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  check('manifest.json is an array of 16 levels', Array.isArray(manifest) && manifest.length === 16);

  const tutorials = manifest.filter(m => m.category === 'tutorial');
  const campaign = manifest.filter(m => m.category === 'campaign');

  check('manifest contains 6 tutorial levels', tutorials.length === 6);
  check('manifest contains 10 campaign levels', campaign.length === 10);

  // Check each level file exists on disk
  for (const item of manifest) {
    const filePath = join(ROOT_DIR, item.file);
    const fileExists = existsSync(filePath);
    check(`Level file exists: ${item.file}`, fileExists);
    if (fileExists) {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      check(`  -> ${item.file} matches id "${item.id}"`, String(data.id) === String(item.id));
    }
  }
}

console.log('\n----------------------------------------');
if (failed) {
  console.error('❌ Static integrity verification failed!\n');
  process.exit(1);
} else {
  console.log('✨ All static integrity and architecture checks passed!\n');
  process.exit(0);
}
