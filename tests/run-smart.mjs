/**
 * Smart Change-Driven Test Runner for Casual Maze Game
 * Detects git changes, resolves transitive test dependencies, and skips cached passes.
 *
 * Usage:
 *   node tests/run-smart.mjs                  # Run tests affected by working tree changes
 *   node tests/run-smart.mjs --base=origin/main # Compare against origin/main branch
 *   node tests/run-smart.mjs --no-cache       # Ignore cache and re-run affected tests
 *   node tests/run-smart.mjs --all            # Fallback to run all tests
 */

import path from 'path';
import { SmartTestResolver } from './harness/smart-resolver.mjs';
import { run } from './harness/index.mjs';

const args = process.argv.slice(2);
const noCache = args.includes('--no-cache');
const runAllFlag = args.includes('--all');
const baseArg = args.find(a => a.startsWith('--base='));
const baseRef = baseArg ? baseArg.slice(7) : (args.includes('--branch') ? 'origin/main' : 'HEAD');

const resolver = new SmartTestResolver();

console.log('=== CASUAL MAZE GAME: SMART CHANGE-DRIVEN TEST RUNNER ===\n');

if (runAllFlag) {
  console.log('Mode: --all specified, executing full master test suite...\n');
  await import('./run-all.mjs');
  process.exit(0);
}

// 1. Inspect changed files
const changedFiles = resolver.getChangedFiles(baseRef);

if (changedFiles.length === 0) {
  console.log('✨ No modified or untracked files detected in working tree.');
  console.log('   All tests remain valid in cache.');
  console.log('   (Run "npm test" or "npm run test:changed -- --all" to force a full run)\n');
  process.exit(0);
}

console.log(`🔍 Detected ${changedFiles.length} modified file(s):`);
changedFiles.slice(0, 10).forEach(f => console.log(`   • ${f}`));
if (changedFiles.length > 10) {
  console.log(`   ... and ${changedFiles.length - 10} more`);
}
console.log('');

// 2. Resolve dependent test suites
const { suitesToRun, all, reasons } = resolver.resolveSuites(changedFiles);

if (all) {
  console.log('⚡ Core framework change detected. Triggering full test suite:');
  reasons.forEach(r => console.log(`   ↳ ${r}`));
  console.log('');
  await import('./run-all.mjs');
  process.exit(0);
}

if (suitesToRun.length === 0) {
  console.log('✨ None of the modified files affect executable game logic or test suites.');
  console.log('   (e.g., markdown docs, scratch files, or image metadata).');
  console.log('   Skipping test execution.\n');
  process.exit(0);
}

console.log(`🎯 Resolved ${suitesToRun.length} affected test suite(s):`);
suitesToRun.slice(0, 15).forEach(s => console.log(`   ✓ ${s}`));
if (suitesToRun.length > 15) {
  console.log(`   ... and ${suitesToRun.length - 15} more`);
}
console.log('');

// 3. Filter against cache
let finalSuites = suitesToRun;
if (!noCache) {
  const { toRun, skipped } = resolver.filterCached(suitesToRun);
  if (skipped.length > 0) {
    console.log(`⚡ Cached passes: skipping ${skipped.length} unchanged test file(s).`);
  }
  finalSuites = toRun;
}

if (finalSuites.length === 0) {
  console.log('✨ All affected test files are already passed and unmodified in cache.');
  console.log('   Use --no-cache to re-run.\n');
  process.exit(0);
}

console.log(`🚀 Executing ${finalSuites.length} test suite(s)...\n`);

// 4. Dynamically import and run resolved suites
for (const suitePath of finalSuites) {
  try {
    const fullPath = path.resolve(suitePath);
    await import(`file://${fullPath.replace(/\\/g, '/')}`);
  } catch (err) {
    console.error(`❌ Failed to load test suite ${suitePath}:`, err);
    process.exit(1);
  }
}

const results = await run();

// 5. Update cache on passing suites
if (results.failed === 0) {
  finalSuites.forEach(s => resolver.recordPass(s));
  resolver.saveCache();
  console.log('\n💾 Test cache updated with verified pass hashes (.test-cache.json).');
} else {
  finalSuites.forEach(s => resolver.recordFail(s));
  resolver.saveCache();
}

process.exit(results.failed > 0 ? 1 : 0);
