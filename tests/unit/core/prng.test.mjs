/**
 * Unit Tests: PRNG (Pseudorandom Number Generator) Subsystem
 */

import { describe, it, assert, assertEqual, assertInRange, assertDeepEqual } from '../../harness/index.mjs';
import { PRNG } from '../../../js/core/prng.js';

describe('Core > PRNG', () => {
  it('produces identical deterministic sequences with identical seed', () => {
    const seed = 987654;
    const rngA = new PRNG(seed);
    const rngB = new PRNG(seed);

    for (let i = 0; i < 25; i++) {
      assertEqual(rngA.next(), rngB.next(), `Step ${i} next() float matching`);
    }
  });

  it('generates floats strictly within [0, 1)', () => {
    const rng = new PRNG(42);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      assert(val >= 0 && val < 1, `Float ${val} should be in [0, 1)`);
    }
  });

  it('generates random integers inclusive within [min, max]', () => {
    const rng = new PRNG(1337);
    const min = 5;
    const max = 12;
    const counts = new Map();

    for (let i = 0; i < 200; i++) {
      const n = rng.randInt(min, max);
      assertInRange(n, min, max, `Integer ${n} in range [${min}, ${max}]`);
      counts.set(n, (counts.get(n) || 0) + 1);
    }

    assert(counts.has(min), 'Generates minimum bound');
    assert(counts.has(max), 'Generates maximum bound');
  });

  it('shuffles arrays while preserving all elements and length', () => {
    const rng = new PRNG(5555);
    const original = ['A', 'B', 'C', 'D', 'E', 'F'];
    const shuffled = rng.shuffle([...original]);

    assertEqual(shuffled.length, original.length, 'Preserves array length');
    for (const item of original) {
      assert(shuffled.includes(item), `Preserves element ${item}`);
    }
    assertDeepEqual(shuffled.slice().sort(), original.slice().sort(), 'Contains exact same multiset of elements');
  });

  it('produces different sequences for distinct seeds', () => {
    const rng1 = new PRNG(111);
    const rng2 = new PRNG(222);
    const seq1 = Array.from({ length: 5 }, () => rng1.next());
    const seq2 = Array.from({ length: 5 }, () => rng2.next());
    assert(seq1.some((v, i) => v !== seq2[i]), 'Different seeds produce divergent sequences');
  });
});
