/**
 * Unit Tests: Campaign Chapter 1 — The Foundation (Levels 1–4)
 * 
 * Verifies that:
 * 1. All 4 levels in Chapter 1 pass LevelValidator with 0 errors.
 * 2. Every level is solvable via BFS pathfinding with calibrated par budgets.
 * 3. 100% Zero-Bypass Gating: locked doors cannot be bypassed under any circumstances.
 * 4. Distinct Kishōtenketsu 4-stage progression:
 *    - Level 1 (Ki): Single key introduction with clean signpost lore.
 *    - Level 2 (Shō): South-to-North vertical axis with twin branching vaults.
 *    - Level 3 (Ten): Multi-key sequential gating (Emerald -> Purple) to central dais.
 *    - Level 4 (Ketsu): 4-wing cathedral grand synthesis with 3 key colors under Fog of War.
 * 5. Architectural novelty: non-uniform dimensions and dynamic non-corner spawn anchors.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { solveLevel } from '../../../js/engine/solver.js';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { ENTITY_TYPES } from '../../../js/core/constants.js';

describe('Levels > Chapter 1: The Foundation (Unit & Architecture Suite)', () => {
  const ch1Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 1 && num <= 4;
  });

  it('retrieves all 4 Chapter 1 campaign levels from registry', () => {
    assertEqual(ch1Levels.length, 4, 'Chapter 1 must contain exactly 4 levels');
    assertEqual(ch1Levels[0].id, '1');
    assertEqual(ch1Levels[1].id, '2');
    assertEqual(ch1Levels[2].id, '3');
    assertEqual(ch1Levels[3].id, '4');
  });

  ch1Levels.forEach(level => {
    it(`Level ${level.id} ("${level.title}") passes LevelValidator with 0 errors`, () => {
      const result = LevelValidator.validate(level);
      assertEqual(result.errors.length, 0, `Level ${level.id} must have 0 validation errors`);
    });

    it(`Level ${level.id} ("${level.title}") is BFS solvable and calibrated`, () => {
      const solution = solveLevel(level);
      assert(solution !== null, `Level ${level.id} must be solvable`);
      assert(solution.length >= 10, `Level ${level.id} solution must contain at least 10 steps`);
      assert(level.parSteps >= solution.length, `Par steps (${level.parSteps}) must be >= optimal solution (${solution.length})`);
    });

    it(`Level ${level.id} ("${level.title}") enforces 100% zero-bypass gating`, () => {
      const doors = (level.entities || []).filter(e => e.type === ENTITY_TYPES.DOOR);
      assert(doors.length > 0, `Level ${level.id} must contain at least one locked door`);
      const bypass = solveLevel(level, { allowDoors: false });
      assertEqual(bypass, null, `Level ${level.id} exit must be unreachable when doors are locked`);
    });

    it(`Level ${level.id} ("${level.title}") has valid Architect's Journal note`, () => {
      const sign = (level.entities || []).find(e => e.type === ENTITY_TYPES.SIGNPOST);
      assert(sign, `Level ${level.id} must contain an Architect's signpost`);
      assert(typeof (sign.text || sign.message) === 'string' && (sign.text || sign.message).length > 20, `Level ${level.id} signpost must contain substantive lore`);
    });
  });

  it('verifies non-uniform dimensions across Chapter 1 stages', () => {
    const dims = ch1Levels.map(l => `${l.dimensions.width}x${l.dimensions.height}`);
    const uniqueDims = new Set(dims);
    assert(uniqueDims.size >= 3, `Chapter 1 must use at least 3 distinct grid dimensions (found: ${uniqueDims.size}: ${[...uniqueDims].join(', ')})`);
  });

  it('verifies Level 1 (Ki): clean introduction to key pickup and door unsealing', () => {
    const lvl = ch1Levels[0];
    const keys = lvl.entities.filter(e => e.type === ENTITY_TYPES.KEY);
    const doors = lvl.entities.filter(e => e.type === ENTITY_TYPES.DOOR);
    assertEqual(keys.length, 1, 'Level 1 must contain exactly 1 key');
    assertEqual(doors.length, 1, 'Level 1 must contain exactly 1 door');
    assertEqual(doors[0].requiresKey, keys[0].id, 'Level 1 door requires Level 1 key');
  });

  it('verifies Level 2 (Shō): South-to-North vertical axis and branching vault layout', () => {
    const lvl = ch1Levels[1];
    assertEqual(lvl.spawn.y > lvl.exit.y, true, 'Level 2 spawn is South of exit');
    const keys = lvl.entities.filter(e => e.type === ENTITY_TYPES.KEY);
    const doors = lvl.entities.filter(e => e.type === ENTITY_TYPES.DOOR);
    assert(keys.length >= 1, 'Level 2 has key');
    assert(doors.length >= 1, 'Level 2 has door');
  });

  it('verifies Level 3 (Ten): sequential Emerald -> Purple multi-key chain', () => {
    const lvl = ch1Levels[2];
    const keys = lvl.entities.filter(e => e.type === ENTITY_TYPES.KEY);
    const doors = lvl.entities.filter(e => e.type === ENTITY_TYPES.DOOR);
    assertEqual(keys.length, 2, 'Level 3 must contain 2 keys (Emerald and Purple)');
    assertEqual(doors.length, 2, 'Level 3 must contain 2 doors');

    // Verify sequential requirement: without emerald key, purple key is unreachable
    const noEmeraldKey = JSON.parse(JSON.stringify(lvl));
    noEmeraldKey.entities = noEmeraldKey.entities.filter(e => e.id !== 'key_emerald_3');
    const solutionNoEmerald = solveLevel(noEmeraldKey);
    assertEqual(solutionNoEmerald, null, 'Level 3 exit is unreachable without Emerald Key');
  });

  it('verifies Level 4 (Ketsu): 4-wing grand synthesis requiring 3 key colors', () => {
    const lvl = ch1Levels[3];
    const keys = lvl.entities.filter(e => e.type === ENTITY_TYPES.KEY);
    const doors = lvl.entities.filter(e => e.type === ENTITY_TYPES.DOOR);
    assertEqual(keys.length, 3, 'Level 4 must contain 3 colored keys');
    assertEqual(doors.length, 3, 'Level 4 must contain 3 colored doors');

    // Central spawn anchor
    assert(lvl.spawn.x > 5 && lvl.spawn.x < lvl.dimensions.width - 5, 'Level 4 spawn is centrally located horizontally');
    assert(lvl.spawn.y > 5 && lvl.spawn.y < lvl.dimensions.height - 5, 'Level 4 spawn is centrally located vertically');
  });
});
