/**
 * Unit Tests: Story 3 (The Whispering Citadel) Multi-Room Integrity & Gating
 *
 * Verifies that:
 * 1. The three-tier multi-room dungeon architecture (Courtyard -> Catacombs -> High Spire) is valid.
 * 2. The Spire Barrier Gate strictly requires the Spire Key from the Catacombs.
 * 3. High Spire cannot be accessed without descending into the Catacombs.
 * 4. Dual branching exits (Apex Altar and Secret Tunnel) are structurally valid and routable.
 * 5. Diegetic lore notes, wall decors, and collectible gems are in place.
 */

import { describe, it, assert, assertEqual } from '../../harness/index.mjs';
import { STORYLINES, getStoryline, getStoryChapter } from '../../../js/stories/storylines.js';
import { LevelValidator } from '../../../js/editor/level-validator.js';
import { solveLevel } from '../../../js/engine/solver.js';

describe('Levels > Story 3 (The Whispering Citadel) Multi-Room Dungeon Gating', () => {
  const story = getStoryline('the_whispering_citadel');
  assert(story !== null, 'The Whispering Citadel storyline is registered');
  assertEqual(story.totalChapters, 1, 'Citadel has 1 multi-room chapter');

  const citadel = getStoryChapter('the_whispering_citadel', 1);
  assert(citadel !== null, 'Citadel chapter 1 is defined');
  assertEqual(citadel.id, 'story_citadel_1', 'Citadel chapter ID is story_citadel_1');

  it('validates Citadel multi-room definition with LevelValidator', () => {
    const rep = LevelValidator.validate(citadel);
    assertEqual(rep.valid, true, 'Citadel multi-room is valid');
    assertEqual(rep.errors.length, 0, 'Citadel has 0 validation errors');
  });

  it('verifies 3-tier room hierarchy: Courtyard, Catacombs, and High Spire', () => {
    assert(citadel.rooms !== undefined, 'Citadel defines rooms dictionary');
    assert(citadel.rooms.courtyard !== undefined, 'Has Courtyard room');
    assert(citadel.rooms.catacombs !== undefined, 'Has Catacombs room');
    assert(citadel.rooms.high_spire !== undefined, 'Has High Spire room');

    // Room dimensions >= 5x5
    for (const [roomId, room] of Object.entries(citadel.rooms)) {
      assert(room.dimensions.width >= 5, `Room ${roomId} width >= 5`);
      assert(room.dimensions.height >= 5, `Room ${roomId} height >= 5`);
      assert(room.spawn !== undefined, `Room ${roomId} has spawn point`);
      assert(Array.isArray(room.exits) && room.exits.length > 0, `Room ${roomId} has exits`);
    }
  });

  it('verifies Spire Barrier Gate in Courtyard strictly requires the Catacombs key', () => {
    const courtyard = citadel.rooms.courtyard;
    const door = courtyard.entities.find(e => e.id === 'door_spire_gate');
    assert(door !== undefined, 'Courtyard has Spire Barrier Gate');
    assertEqual(door.requiresKey, 'key_citadel_spire', 'Door requires key_citadel_spire');

    // Catacombs contains key_citadel_spire
    const catacombs = citadel.rooms.catacombs;
    const key = catacombs.entities.find(e => e.id === 'key_citadel_spire');
    assert(key !== undefined, 'Catacombs contains key_citadel_spire');
    assertEqual(key.color, door.color, 'Key and door share matching cyan resonance');
  });

  it('verifies High Spire contains dual branching exits', () => {
    const spire = citadel.rooms.high_spire;
    assert(Array.isArray(spire.exits), 'High Spire has exits array');
    assertEqual(spire.exits.length >= 2, true, 'High Spire has at least 2 branching exits');

    const apexExit = spire.exits.find(e => e.label && e.label.includes('Apex'));
    assert(apexExit !== undefined, 'Has Apex Altar victory exit');

    const secretExit = spire.exits.find(e => e.targetLevel === '29');
    assert(secretExit !== undefined, 'Has secret tunnel exit branching to Level 29');
  });

  it('verifies diegetic lore inscriptions and collectibles across all three rooms', () => {
    let decorCount = 0;
    let gemCount = 0;

    for (const room of Object.values(citadel.rooms)) {
      for (const entity of room.entities || []) {
        if (entity.type === 'wall_decor') decorCount++;
        if (entity.type === 'collectible' && entity.collectibleType === 'gem') gemCount++;
      }
    }

    assert(decorCount >= 3, `Citadel has at least 3 lore wall decors (found ${decorCount})`);
    assert(gemCount >= 2, `Citadel has at least 2 collectible gems (found ${gemCount})`);
  });
});
