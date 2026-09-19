/**
 * Campaign Chapter 8 Playthrough Suite: The Shifting Monolith (Levels 29–32)
 * Validates 90° perspective rotation, underpasses, 4-faced monoliths, and branching exits.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { CAMPAIGN_LEVELS } from '../../../js/levels/default-levels.js';
import { simulateCampaignLevelPlaythrough } from '../../helpers/campaign-solver.mjs';
import { TILES } from '../../../js/core/constants.js';

describe('Campaign > Chapter 8: The Shifting Monolith (Levels 29–32)', () => {
  const chapter8Levels = CAMPAIGN_LEVELS.filter(lvl => {
    const num = parseInt(lvl.id, 10);
    return num >= 29 && num <= 32;
  });

  assertEqual(chapter8Levels.length, 4, 'Chapter 8 contains 4 levels');

  chapter8Levels.forEach(level => {
    it(`plays through Level ${level.id} (${level.title}) to victory`, () => {
      simulateCampaignLevelPlaythrough(level);
    });
  });

  it('validates Level 29 (The Cardinal Needle) rotation hints and entities', () => {
    const l29 = chapter8Levels.find(l => l.id === '29');
    assert(l29 !== undefined, 'Level 29 exists');
    assertEqual(l29.title, 'The Cardinal Needle');
    assert(l29.help.message.includes('[Q] and [R]'), 'Help text teaches Q and R rotation keys');
    assert(l29.entities.some(e => e.type === 'key' && e.id === 'key_gold_29'), 'Has golden needle key');
    assert(l29.entities.some(e => e.type === 'door' && e.id === 'door_gold_29'), 'Has needle sanctum gate');
  });

  it('validates Level 30 (The Hidden Underpass) elevated bridge and underpass tunnel', () => {
    const l30 = chapter8Levels.find(l => l.id === '30');
    assert(l30 !== undefined, 'Level 30 exists');
    assertEqual(l30.title, 'The Hidden Underpass');
    assertEqual(l30.layers.ground[7][7], TILES.BRIDGE_EW, 'Ground layer has BRIDGE_EW underpass tile');
    assertEqual(l30.layers.overhead[7][7], TILES.BRIDGE_NS, 'Overhead layer has BRIDGE_NS bridge tile');
    assert(l30.entities.some(e => e.id === 'key_cyan_30' && e.x === 7 && e.y === 7), 'Underpass key is at (7, 7, 0)');
    assert(l30.entities.some(e => e.id === 'gem_bridge_top' && e.elevation === 1), 'Bridge top gem is at elevation 1');
  });

  it('validates Level 31 (The Four-Faced Pillar) multi-directional decor inscriptions', () => {
    const l31 = chapter8Levels.find(l => l.id === '31');
    assert(l31 !== undefined, 'Level 31 exists');
    assertEqual(l31.title, 'The Four-Faced Pillar');

    const carvings = l31.entities.filter(e => e.type === 'wall_decor' && e.decorType === 'carving');
    assertEqual(carvings.length, 4, '4 carvings around central monolith');

    const facings = new Set(carvings.map(c => c.facing));
    assert(facings.has('north'), 'Has North facing carving');
    assert(facings.has('east'), 'Has East facing carving');
    assert(facings.has('south'), 'Has South facing carving');
    assert(facings.has('west'), 'Has West facing carving');
  });

  it('validates Level 32 (The Prismatic Spire) branching exits contract', () => {
    const l32 = chapter8Levels.find(l => l.id === '32');
    assert(l32 !== undefined, 'Level 32 exists');
    assertEqual(l32.title, 'The Prismatic Spire');
    assert(Array.isArray(l32.exits), 'Level 32 has exits array');
    assertEqual(l32.exits.length, 2, 'Level 32 has 2 branching exits');

    const primaryExit = l32.exits.find(e => e.id === 'exit_spire_primary');
    assert(primaryExit !== undefined, 'Has primary victory exit');
    assertEqual(primaryExit.targetLevel, '1', 'Primary exit returns to level 1');

    const branchExit = l32.exits.find(e => e.id === 'exit_spire_citadel_branch');
    assert(branchExit !== undefined, 'Has secret citadel branch exit');
    assertEqual(branchExit.targetLevel, 'story_citadel_1', 'Branch exit targets story_citadel_1');
  });
});
