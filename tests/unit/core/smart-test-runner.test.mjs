/**
 * Unit Test for Smart Change-Driven Test Resolver & Caching Engine (BL-142)
 */

import { describe, it } from '../../harness/index.mjs';
import { assert } from '../../harness/assertions.mjs';
import { SmartTestResolver } from '../../harness/smart-resolver.mjs';

describe('Smart Change-Driven Test Resolver & Caching Engine (BL-142)', () => {
  const resolver = new SmartTestResolver();

  it('maps direct test edits to their corresponding test file', () => {
    const { suitesToRun, all } = resolver.resolveSuites(['tests/unit/core/prng.test.mjs']);
    assert(!all, 'Does not trigger all tests for a single test edit');
    assert(suitesToRun.includes('tests/unit/core/prng.test.mjs'), 'Resolves direct test file');
  });

  it('maps core constants changes to dependent engine, rendering, and coordinate suites', () => {
    const { suitesToRun, all } = resolver.resolveSuites(['js/core/constants.js']);
    assert(!all, 'Does not trigger ALL suites blindly for constants');
    assert(suitesToRun.includes('tests/unit/core/constants.test.mjs'), 'Includes constants test');
    assert(suitesToRun.includes('tests/unit/engine/collision.test.mjs'), 'Cascades to collision test');
    assert(suitesToRun.includes('tests/unit/engine/perspective-renderer.test.mjs'), 'Cascades to renderer test');
  });

  it('maps entity source edits to entity unit suites and obstacle journeys', () => {
    const { suitesToRun, all } = resolver.resolveSuites(['js/entities/lever.js']);
    assert(!all, 'Does not trigger ALL suites for entity edit');
    assert(suitesToRun.includes('tests/unit/entities/entities.test.mjs'), 'Includes entities test');
    assert(suitesToRun.includes('tests/integration/journeys/obstacle-interactions.journey.test.mjs'), 'Includes obstacle interactions journey');
  });

  it('maps specific chapter level edits to chapter-specific unit and solver tests', () => {
    const { suitesToRun } = resolver.resolveSuites(['levels/chapter_9/level_33.json']);
    assert(suitesToRun.includes('tests/unit/levels/chapter-9.test.mjs'), 'Triggers Chapter 9 unit test');
    assert(suitesToRun.includes('tests/integration/campaign/chapter-9.test.mjs'), 'Triggers Chapter 9 solver');
    assert(!suitesToRun.includes('tests/unit/levels/chapter-1.test.mjs'), 'Does NOT trigger Chapter 1 test');
  });

  it('triggers ALL suites when core test harness execution primitives change', () => {
    const { suitesToRun, all, reasons } = resolver.resolveSuites(['tests/harness/runner.mjs']);
    assert(all, 'Triggers ALL flag when harness runner changes');
    assert(suitesToRun.includes('ALL'), 'Contains ALL in suites');
    assert(reasons.length > 0, 'Provides clear reason for full-run cascade');
  });

  it('computes consistent sha256 file hashes for change detection', () => {
    const hash = resolver.computeFileHash('package.json');
    assert(typeof hash === 'string' && hash.length === 64, 'Computes 64-character sha256 hex hash');
  });

  it('filters cached passing tests correctly', () => {
    resolver.recordPass('tests/unit/core/prng.test.mjs');
    const { toRun, skipped } = resolver.filterCached(['tests/unit/core/prng.test.mjs']);
    assert(skipped.includes('tests/unit/core/prng.test.mjs'), 'Skips unchanged cached passing test');
    assert(toRun.length === 0, 'Nothing left to run when cached');
  });
});
