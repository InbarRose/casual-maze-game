/**
 * Unit Tests: Story 1 (Tutorial Academy) Unbypassable Challenge Integrity
 * 
 * Verifies with the BFS state-space pathfinder that all gates, keys, levers,
 * and bridges in Story 1 (Chapters 1 to 6) cannot be bypassed through open corridors.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { solveLevel } from '../../../js/engine/solver.js';
import { TUTORIAL_LEVELS } from '../../../js/levels/tutorials.js';
import { STORYLINES } from '../../../js/stories/storylines.js';

describe('Levels > Story 1 Unbypassable Challenges & Gate Routing', () => {
  const [t1, t2, t3, t4, t5, t6] = TUTORIAL_LEVELS;

  it('Tutorial 1: First Steps connects spawn to exit portal', () => {
    const solution = solveLevel(t1);
    assert(solution !== null, 'Tutorial 1 must be solvable');
    assert(solution.length > 0, 'Solution must contain steps');
  });

  it('Tutorial 2: The Prismatic Gates strictly requires both Ruby and Sapphire keys', () => {
    // 1. Solvable with full key set
    const fullSolution = solveLevel(t2);
    assert(fullSolution !== null, 'Tutorial 2 must be solvable with all keys');

    // 2. Unsolvable without Ruby Key (Red Door blocks southern corridor)
    const noRed = JSON.parse(JSON.stringify(t2));
    noRed.entities = noRed.entities.filter(e => e.id !== 'key_red_t2');
    const solNoRed = solveLevel(noRed);
    assertEqual(solNoRed, null, 'Tutorial 2 exit must be unreachable without Ruby Key');

    // 3. Unsolvable without Sapphire Key (Blue Door blocks exit chamber)
    const noBlue = JSON.parse(JSON.stringify(t2));
    noBlue.entities = noBlue.entities.filter(e => e.id !== 'key_blue_t2');
    const solNoBlue = solveLevel(noBlue);
    assertEqual(solNoBlue, null, 'Tutorial 2 exit must be unreachable without Sapphire Key');
  });

  it('Tutorial 3: Clockwork Mechanisms strictly requires flipping the sanctuary lever', () => {
    // 1. Solvable with lever activated
    const solution = solveLevel(t3);
    assert(solution !== null, 'Tutorial 3 must be solvable when lever lowers wall (5,5)');

    // 2. Unsolvable if lever is omitted or wall remains solid
    const noLever = JSON.parse(JSON.stringify(t3));
    noLever.entities = [];
    const solNoLever = solveLevel(noLever);
    assertEqual(solNoLever, null, 'Tutorial 3 exit must be unreachable without flipping the lever');
  });

  it('Tutorial 4: The Canopy Crossing strictly requires ascending ramps and crossing the bridge', () => {
    // 1. Solvable across elevated canopy
    const solution = solveLevel(t4);
    assert(solution !== null, 'Tutorial 4 must be solvable');

    // 2. Ground-only path must be blocked by solid barrier
    const noOverhead = JSON.parse(JSON.stringify(t4));
    noOverhead.layers.overhead = noOverhead.layers.overhead.map(row => row.map(() => 0));
    noOverhead.layers.ground = noOverhead.layers.ground.map(row =>
      row.map(cell => (typeof cell === 'string' && (cell.startsWith('R_') || cell.startsWith('B_'))) ? 1 : cell)
    );
    const solGroundOnly = solveLevel(noOverhead);
    assertEqual(solGroundOnly, null, 'Tutorial 4 exit must be unreachable without using ramps and bridge');
  });

  it('Tutorial 5: The Shrouded Vaults strictly requires retrieving the gold crypt key', () => {
    // 1. Solvable with key
    const solution = solveLevel(t5);
    assert(solution !== null, 'Tutorial 5 must be solvable');

    // 2. Unsolvable without finding gold key
    const noKey = JSON.parse(JSON.stringify(t5));
    noKey.entities = noKey.entities.filter(e => e.type !== 'key');
    const solNoKey = solveLevel(noKey);
    assertEqual(solNoKey, null, 'Tutorial 5 exit must be unreachable without Gold Key');
  });

  it("Tutorial 6: The Guildmaster's Rite requires all keys, the clockwork switch, and the bridge", () => {
    // 1. Solvable with complete sequence
    const solution = solveLevel(t6);
    assert(solution !== null, 'Tutorial 6 must be solvable with full mechanic synthesis');

    // 2. Green Key required for northern portcullis
    const noGreen = JSON.parse(JSON.stringify(t6));
    noGreen.entities = noGreen.entities.filter(e => e.id !== 'key_green_t6');
    assertEqual(solveLevel(noGreen), null, 'Exit unreachable without Green Key');

    // 3. Blue Key required for central magic seal
    const noBlue = JSON.parse(JSON.stringify(t6));
    noBlue.entities = noBlue.entities.filter(e => e.id !== 'key_blue_t6');
    assertEqual(solveLevel(noBlue), null, 'Exit unreachable without Blue Key');

    // 4. Red Key required for final vault hatch
    const noRed = JSON.parse(JSON.stringify(t6));
    noRed.entities = noRed.entities.filter(e => e.id !== 'key_red_t6');
    assertEqual(solveLevel(noRed), null, 'Exit unreachable without Red Key');

    // 5. Lever required to lower wall (2,14) accessing the Red Key chamber
    const noLever = JSON.parse(JSON.stringify(t6));
    noLever.entities = noLever.entities.filter(e => e.id !== 'lever_t6');
    assertEqual(solveLevel(noLever), null, 'Exit unreachable without activating the sanctuary lever');

    // 6. Bridge & Ramps required
    const noBridge = JSON.parse(JSON.stringify(t6));
    noBridge.layers.overhead = noBridge.layers.overhead.map(row => row.map(() => 0));
    noBridge.layers.ground = noBridge.layers.ground.map(row =>
      row.map(cell => (typeof cell === 'string' && (cell.startsWith('R_') || cell.startsWith('B_'))) ? 1 : cell)
    );
    assertEqual(solveLevel(noBridge), null, 'Exit unreachable without crossing the elevated bridge');
  });

  it('Story 1 campaign metadata in STORYLINES preserves unbypassable mechanics across chapters', () => {
    const noviceStory = STORYLINES.find(s => s.id === 'novice_initiation');
    assert(noviceStory !== null, 'Story 1 (novice_initiation) must exist in STORYLINES registry');
    assertEqual(noviceStory.chapters.length, 6, 'Story 1 must have 6 chapters');

    // Chapter 3 (Lever)
    const ch3 = noviceStory.chapters[2];
    const ch3NoLever = JSON.parse(JSON.stringify(ch3));
    ch3NoLever.entities = [];
    assertEqual(solveLevel(ch3NoLever), null, 'Story 1 Chapter 3 must require lever');

    // Chapter 6 (Final trial)
    const ch6 = noviceStory.chapters[5];
    const ch6NoLever = JSON.parse(JSON.stringify(ch6));
    ch6NoLever.entities = ch6NoLever.entities.filter(e => e.id !== 'lever_t6');
    assertEqual(solveLevel(ch6NoLever), null, 'Story 1 Chapter 6 must require lever');
  });
});
